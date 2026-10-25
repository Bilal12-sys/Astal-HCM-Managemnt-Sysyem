import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { app } from "../server.js";
import AiLog from "../models/aiLog.model.js";
import Announcement from "../models/announcement.model.js";
import Attendance from "../models/attendance.model.js";
import AttendanceCorrection from "../models/attendanceCorrection.model.js";
import AuditLog from "../models/audit.model.js";
import Department from "../models/department.model.js";
import Designation from "../models/designation.model.js";
import Employee from "../models/employee.model.js";
import Holiday from "../models/holiday.model.js";
import LeaveRequest from "../models/leaveRequest.model.js";
import LeaveType from "../models/leaveType.model.js";
import Notification from "../models/notification.model.js";
import PayrollRun from "../models/payrollRun.model.js";
import Payslip from "../models/payslip.model.js";
import Settings from "../models/settings.model.js";
import HcmUser from "../models/user.model.js";
import { Tasks } from "../model/task.model.js";
import LegacyUser from "../model/user.model.js";
import { askAssistant } from "../modules/ai/ai.service.js";
import { getAiSettings } from "../modules/ai/aiClient.js";
import { createAdminFromEnvironment } from "../modules/setup/setup.service.js";
import Verify_token from "../middleware/verifytoken.js";
import { getScopeFilter } from "../middleware/scope.js";
import requireRole from "../middleware/requireRole.js";
import AppError from "../utils/AppError.js";
import { failureResponse, successResponse } from "../utils/response.js";
import { getDistanceMeters } from "../utils/haversine.js";
import { calculateGrossSalary, calculateMonthlyTax, roundMoney } from "../utils/money.js";
import { generateTemporaryPassword } from "../utils/password.js";
import {
  getPktDate,
  getPktDayName,
  getPktTime,
  isIsoDate,
  isIsoMonth,
  PKT_TIME_ZONE,
} from "../utils/time.js";
import { countWorkingDays, getWorkingDays } from "../utils/workingDays.js";
import validateEnvironment from "../config/env.js";

process.env.JWT_SECRET = "isolated-test-secret-with-at-least-thirty-two-characters";
process.env.JWT_EXPIRES_IN = "1d";
process.env.AI_HOURLY_LIMIT = "20";

const models = [
  AiLog,
  Announcement,
  Attendance,
  AttendanceCorrection,
  AuditLog,
  Department,
  Designation,
  Employee,
  Holiday,
  LeaveRequest,
  LeaveType,
  Notification,
  PayrollRun,
  Payslip,
  Settings,
  HcmUser,
  Tasks,
  LegacyUser,
];

let httpServer;
let baseUrl;
let admin;
let adminToken;
let hr;
let hrTemporaryPassword;
let hrToken;
let hrChangedPassword;

const request = async (path, { method = "GET", body, token, headers = {} } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let responseBody;

  try {
    responseBody = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${method} ${path} returned non-JSON (${response.status})`);
  }

  return { status: response.status, body: responseBody, headers: response.headers };
};

const temporaryEnvironment = async (values, callback) => {
  const original = new Map(Object.keys(values).map((key) => [key, process.env[key]]));

  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    return await callback();
  } finally {
    for (const [key, value] of original) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};

const captureConsoleErrors = async (callback) => {
  const originalConsoleError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args);

  try {
    return { result: await callback(), errors };
  } finally {
    console.error = originalConsoleError;
  }
};

const valuesMatch = (record, filter) => {
  if (!filter || Object.keys(filter).length === 0) {
    return true;
  }

  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$or") {
      return expected.some((condition) => valuesMatch(record, condition));
    }

    const actual = record[key];

    if (expected instanceof RegExp) {
      return expected.test(actual || "");
    }

    if (expected && typeof expected.toHexString === "function") {
      return String(actual) === expected.toHexString();
    }

    if (expected && typeof expected === "object" && !(expected instanceof Date)) {
      return Object.entries(expected).every(([operator, value]) => {
        if (operator === "$gte") {
          return new Date(actual) >= new Date(value);
        }
        if (operator === "$lte") {
          return new Date(actual) <= new Date(value);
        }
        return false;
      });
    }

    return String(actual?._id || actual) === String(expected?._id || expected);
  });
};

const installInMemoryModelStubs = () => {
  for (const model of models) {
    const records = new Map();
    const modelName = model.modelName;
    const idOf = (record) => String(record._id);
    const save = (record) => {
      records.set(idOf(record), record);
      return record;
    };
    const makeDocument = (values) => {
      const document = new model(values);

      if (model.schema.options.timestamps) {
        document.createdAt ||= new Date();
        document.updatedAt ||= new Date();
      }

      return document;
    };
    const findRecords = (filter) => [...records.values()].filter((record) => valuesMatch(record, filter));
    const createQuery = (getValue) => {
      const options = { offset: 0, limit: Number.MAX_SAFE_INTEGER, sort: null, projection: null, lean: false };
      const query = {
        select(projection) {
          if (projection && typeof projection === "object") {
            options.projection = projection;
          }
          return query;
        },
        populate() {
          return query;
        },
        lean() {
          options.lean = true;
          return query;
        },
        sort(sortOptions) {
          options.sort = sortOptions;
          return query;
        },
        skip(offset) {
          options.offset = offset;
          return query;
        },
        limit(limit) {
          options.limit = limit;
          return query;
        },
        then(resolve, reject) {
          let result = getValue();

          if (Array.isArray(result)) {
            if (options.sort) {
              const [[field, direction]] = Object.entries(options.sort);
              result = result.sort((left, right) => {
                const leftValue = left[field];
                const rightValue = right[field];
                const comparison = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
                return comparison * direction;
              });
            }

            result = result.slice(options.offset, options.offset + options.limit);
          }

          const project = (record) => {
            if (!record || !options.projection) {
              return record;
            }

            const plainRecord = record.toObject ? record.toObject() : { ...record };
            const projectionEntries = Object.entries(options.projection);
            const includedFields = projectionEntries
              .filter(([, included]) => included)
              .map(([field]) => field);
            const excludedFields = projectionEntries
              .filter(([, included]) => !included)
              .map(([field]) => field);

            if (includedFields.length > 0) {
              const selected = Object.fromEntries(
                includedFields
                  .filter((field) => Object.hasOwn(plainRecord, field))
                  .map((field) => [field, plainRecord[field]])
              );
              if (!Object.hasOwn(options.projection, "_id") && plainRecord._id) {
                selected._id = plainRecord._id;
              }
              return selected;
            }

            for (const field of excludedFields) {
              delete plainRecord[field];
            }
            return plainRecord;
          };

          result = Array.isArray(result) ? result.map(project) : project(result);
          if (options.lean && !options.projection) {
            result = Array.isArray(result)
              ? result.map((record) => (record?.toObject ? record.toObject() : record))
              : result?.toObject
                ? result.toObject()
                : result;
          }

          return Promise.resolve(result).then(resolve, reject);
        },
        catch(reject) {
          return query.then(undefined, reject);
        },
      };
      return query;
    };

    model.create = async (values) => {
      if (modelName === "User" || modelName === "HcmUser") {
        const duplicate = findRecords({ email: values.email })[0];
        if (duplicate) {
          const error = new Error("Duplicate email");
          error.code = 11000;
          throw error;
        }
      }

      const document = makeDocument(values);
      await document.validate();
      save(document);
      return document;
    };
    model.insertMany = async (items) => Promise.all(items.map((item) => model.create(item)));
    model.exists = async (filter) => {
      const found = findRecords(filter)[0];
      return found ? { _id: found._id } : null;
    };
    model.findById = (id) =>
      createQuery(() => {
        if (!mongoose.isValidObjectId(id)) {
          throw new mongoose.Error.CastError("ObjectId", id, "_id");
        }
        return records.get(String(id)) || null;
      });
    model.findOne = (filter) =>
      createQuery(() => findRecords(filter)[0] || null);
    model.find = (filter = {}) =>
      createQuery(() => findRecords(filter));
    model.countDocuments = async (filter = {}) => findRecords(filter).length;
    model.deleteMany = async (filter = {}) => {
      for (const record of findRecords(filter)) {
        records.delete(idOf(record));
      }
      return { acknowledged: true };
    };
    model.findOneAndUpdate = (filter, update, options = {}) =>
      createQuery(() => {
        let record = findRecords(filter)[0];
        if (!record && options.upsert) {
          record = makeDocument(update.$setOnInsert || update);
        } else if (record) {
          Object.assign(record, update.$set || update);
        }
        return record ? save(record) : null;
      });
    model.updateOne = async (filter, update, options = {}) => {
      let record = findRecords(filter)[0];
      if (!record && options.upsert) {
        record = makeDocument(update.$setOnInsert || update);
        save(record);
      }
      return { acknowledged: true, matchedCount: record ? 1 : 0, upsertedCount: record ? 1 : 0 };
    };
    model.findByIdAndDelete = (id) =>
      createQuery(() => {
        if (!mongoose.isValidObjectId(id)) {
          throw new mongoose.Error.CastError("ObjectId", id, "_id");
        }
        const record = records.get(String(id)) || null;
        if (record) {
          records.delete(String(id));
        }
        return record;
      });
    model.findByIdAndUpdate = (id, update) =>
      createQuery(() => {
        const record = records.get(String(id));
        if (!record) {
          return null;
        }
        Object.assign(record, update);
        return save(record);
      });

    model.prototype.save = async function saveMockDocument() {
      records.set(idOf(this), this);
      return this;
    };
  }
};

before(async () => {
  installInMemoryModelStubs();
  httpServer = app.listen(0);
  await once(httpServer, "listening");
  baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
});

after(async () => {
  if (httpServer) {
    await new Promise((resolve, reject) => {
      httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  }

});

test("environment validation checks required settings and JWT strength", async () => {
  await temporaryEnvironment(
    { MONGO_URI: undefined, JWT_SECRET: undefined },
    async () => {
      assert.throws(validateEnvironment, /Missing required environment variables/);
    }
  );

  await temporaryEnvironment(
    { MONGO_URI: "mongodb://localhost/test", JWT_SECRET: "too-short" },
    async () => {
      assert.throws(validateEnvironment, /at least 32 characters/);
    }
  );

  await temporaryEnvironment(
    { MONGO_URI: "mongodb://localhost/test", JWT_SECRET: "valid-test-secret-with-more-than-thirty-two-characters" },
    async () => {
      assert.doesNotThrow(validateEnvironment);
    }
  );
});

test("test harness does not open a MongoDB connection", () => {
  assert.equal(mongoose.connection.readyState, 0);
});

test("health, not-found, headers, and common response helpers", async () => {
  const health = await request("/health");
  assert.equal(health.status, 200);
  assert.deepEqual(health.body, { success: true, data: { status: "ok" } });
  assert.ok(health.headers.get("x-content-type-options"));
  assert.equal(health.headers.get("x-powered-by"), null);

  const missing = await request("/no-such-route");
  assert.equal(missing.status, 404);
  assert.deepEqual(missing.body, { success: false, message: "Route not found" });

  const response = {
    statusCode: 0,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  successResponse(response, { item: 1 }, 201, { page: 1, limit: 5, total: 1 });
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body, {
    success: true,
    data: { item: 1 },
    meta: { page: 1, limit: 5, total: 1 },
  });

  failureResponse(response, "Invalid", 422, [{ field: "name" }], "INVALID");
  assert.equal(response.statusCode, 422);
  assert.deepEqual(response.body, {
    success: false,
    message: "Invalid",
    errors: [{ field: "name" }],
    code: "INVALID",
  });
});

test("PKT date, ISO, working-day, salary, tax, and distance utilities", () => {
  assert.equal(PKT_TIME_ZONE, "Asia/Karachi");
  assert.equal(getPktDate(new Date("2026-10-24T20:00:00.000Z")), "2026-10-25");
  assert.equal(getPktTime(new Date("2026-10-25T04:15:00.000Z")), "09:15");
  assert.equal(getPktDayName("2026-10-25"), "Sun");
  assert.equal(isIsoDate("2026-02-28"), true);
  assert.equal(isIsoDate("2026-02-30"), false);
  assert.equal(isIsoDate("25-02-2026"), false);
  assert.equal(isIsoMonth("2026-10"), true);
  assert.equal(isIsoMonth("2026-13"), false);

  assert.deepEqual(
    getWorkingDays("2026-10-23", "2026-10-26", ["Sat", "Sun"], ["2026-10-26"]),
    ["2026-10-23"]
  );
  assert.equal(countWorkingDays("2026-10-23", "2026-10-26"), 2);
  assert.equal(countWorkingDays("2026-10-23", "2026-10-23"), 1);
  assert.throws(() => getWorkingDays("2026-10-27", "2026-10-26"), TypeError);
  assert.throws(() => getWorkingDays("not-a-date", "2026-10-26"), TypeError);

  assert.equal(calculateGrossSalary(100000), 150000);
  assert.equal(calculateMonthlyTax(600000), 0);
  assert.equal(calculateMonthlyTax(1200000), 2500);
  assert.equal(calculateMonthlyTax(2400000), 17500);
  assert.equal(calculateMonthlyTax(3600000), 42500);
  assert.equal(calculateMonthlyTax(4800000), 77500);
  assert.equal(roundMoney(1.005), 1.01);
  assert.throws(() => calculateGrossSalary(0), TypeError);
  assert.throws(() => calculateMonthlyTax(-1), TypeError);
  assert.throws(() => roundMoney(Number.NaN), TypeError);

  assert.ok(Math.abs(getDistanceMeters(0, 0, 0, 1) - 111195) < 100);
  assert.equal(getDistanceMeters(10, 20, 10, 20), 0);
  assert.throws(() => getDistanceMeters(0, Number.NaN, 0, 1), TypeError);
  assert.equal(generateTemporaryPassword(12).length, 12);
  assert.throws(() => generateTemporaryPassword(7), RangeError);
});

test("scope, role, and token-verification middleware", async () => {
  assert.deepEqual(getScopeFilter({ role: "employee", employeeId: "emp-1" }), {
    employeeId: "emp-1",
  });
  assert.deepEqual(getScopeFilter({ role: "employee" }), { employeeId: null });
  assert.deepEqual(getScopeFilter({ role: "hr" }), {});

  let roleError;
  requireRole("admin")({ user: { role: "employee" } }, {}, (error) => {
    roleError = error;
  });
  assert.ok(roleError instanceof AppError);
  assert.equal(roleError.status, 403);

  const makeResponse = () => ({
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  });

  const noTokenResponse = makeResponse();
  Verify_token({ headers: {} }, noTokenResponse, () => {
    assert.fail("missing token must not continue");
  });
  assert.equal(noTokenResponse.statusCode, 401);

  const invalidTokenResponse = makeResponse();
  Verify_token({ headers: { authorization: "Bearer invalid" } }, invalidTokenResponse, () => {
    assert.fail("invalid token must not continue");
  });
  assert.equal(invalidTokenResponse.statusCode, 401);
});

test("all Mongoose models compile with timestamps and expected indexes", () => {
  const hcmModels = [
    AiLog,
    Announcement,
    Attendance,
    AttendanceCorrection,
    AuditLog,
    Department,
    Designation,
    Employee,
    Holiday,
    LeaveRequest,
    LeaveType,
    Notification,
    PayrollRun,
    Payslip,
    Settings,
    HcmUser,
  ];

  assert.equal(hcmModels.every((model) => model.schema.options.timestamps), true);
  assert.equal(Tasks.schema.options.timestamps, true);
  assert.equal(LegacyUser.schema.options.timestamps, true);
  assert.equal(HcmUser.schema.path("passwordHash").options.select, false);
  assert.equal(LegacyUser.schema.path("password").options.select, false);
  assert.equal(Employee.schema.indexes().some(([fields]) => fields.departmentId === 1), true);
  assert.equal(Attendance.schema.indexes().some(([fields]) => fields.employeeId === 1 && fields.date === 1), true);
  assert.equal(LeaveRequest.schema.indexes().some(([fields]) => fields.employeeId === 1), true);
  assert.equal(Notification.schema.indexes().some(([fields]) => fields.userId === 1), true);
  assert.deepEqual(new Settings({ companyName: "Example" }).weekend, ["Sat", "Sun"]);

  const dateValidator = Holiday.schema.path("date").validators.find(
    (validator) => validator.type === "user defined"
  );
  assert.equal(dateValidator.validator("2026-02-30"), false);
  assert.equal(dateValidator.validator("2026-02-28"), true);

  const user = new HcmUser({
    name: "Test Admin",
    email: "hidden-hash@example.test",
    passwordHash: "hashed-value",
    role: "admin",
    firstAdminKey: "first-admin",
  });
  assert.equal(Object.hasOwn(user.toJSON(), "passwordHash"), false);
  assert.equal(Object.hasOwn(user.toJSON(), "firstAdminKey"), false);

  const legacyUser = new LegacyUser({
    username: "legacy-user",
    email: "legacy-user@example.test",
    gender: "other",
    password: "password-hash",
  });
  assert.equal(Object.hasOwn(legacyUser.toJSON(), "password"), false);
});

test("Groq settings validate provider, key, model, and timeout", () => {
  assert.deepEqual(
    getAiSettings({
      AI_PROVIDER: "Groq",
      AI_MODEL: "openai/gpt-oss-120b",
      AI_API_KEY: "test-key-not-used-for-network",
      AI_TIMEOUT_MS: "15000",
    }),
    {
      apiKey: "test-key-not-used-for-network",
      model: "openai/gpt-oss-120b",
      timeoutMs: 15000,
    }
  );
  assert.equal(
    getAiSettings({ AI_PROVIDER: "groq", AI_API_KEY: "key", AI_TIMEOUT_MS: "15000" }).model,
    "openai/gpt-oss-120b"
  );
  assert.throws(() => getAiSettings({ AI_PROVIDER: "gemini", AI_API_KEY: "key" }), /AI_PROVIDER/);
  assert.throws(() => getAiSettings({ AI_PROVIDER: "groq", AI_API_KEY: "" }), /AI_API_KEY/);
  assert.throws(
    () =>
      getAiSettings({
        AI_PROVIDER: "groq",
        AI_API_KEY: "key",
        AI_TIMEOUT_MS: "100",
      }),
    /AI_TIMEOUT_MS/
  );
});

test("initial setup creates admin, default settings, leave types, and immutable setup state", async () => {
  const initialStatus = await request("/api/setup/status");
  assert.equal(initialStatus.status, 200);
  assert.deepEqual(initialStatus.body.data, { needsSetup: true });

  const invalidSetup = await request("/api/setup", {
    method: "POST",
    body: { companyName: "", adminName: "Admin", email: "bad-email", password: "short" },
  });
  assert.equal(invalidSetup.status, 400);
  assert.equal(invalidSetup.body.code, "VALIDATION_ERROR");
  assert.ok(invalidSetup.body.errors.length > 0);

  const email = `admin-${randomUUID()}@example.test`;
  const created = await request("/api/setup", {
    method: "POST",
    body: {
      companyName: "Test Company",
      adminName: "Test Admin",
      email,
      password: "Admin-password-123",
    },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.success, true);
  assert.equal(created.body.data.user.email, email);
  assert.equal(created.body.data.user.role, "admin");
  assert.equal(Object.hasOwn(created.body.data.user, "passwordHash"), false);
  assert.equal(Object.hasOwn(created.body.data.user, "firstAdminKey"), false);

  admin = await HcmUser.findById(created.body.data.user._id).select("+passwordHash");
  assert.ok(admin);
  assert.notEqual(admin.passwordHash, "Admin-password-123");
  assert.equal(await bcrypt.compare("Admin-password-123", admin.passwordHash), true);

  const settings = await Settings.findOne({ key: "company" });
  assert.equal(settings.companyName, "Test Company");
  assert.equal(settings.officeStart, "09:00");
  assert.equal(settings.graceMinutes, 15);
  assert.deepEqual(settings.weekend, ["Sat", "Sun"]);
  assert.deepEqual(
    await LeaveType.find().sort({ name: 1 }).select({ _id: 0, name: 1, yearlyQuota: 1 }).lean(),
    [
      { name: "annual", yearlyQuota: 14 },
      { name: "casual", yearlyQuota: 10 },
      { name: "sick", yearlyQuota: 8 },
      { name: "unpaid", yearlyQuota: null },
    ]
  );

  const finalStatus = await request("/api/setup/status");
  assert.deepEqual(finalStatus.body.data, { needsSetup: false });
  const secondSetup = await request("/api/setup", {
    method: "POST",
    body: {
      companyName: "Another Company",
      adminName: "Other Admin",
      email: `other-${randomUUID()}@example.test`,
      password: "Another-password-123",
    },
  });
  assert.equal(secondSetup.status, 403);
  assert.equal(await HcmUser.countDocuments({ role: "admin" }), 1);

  const setupAudit = await AuditLog.findOne({ action: "setup.completed" });
  assert.equal(String(setupAudit.actor), String(admin._id));
});

test("B2 authentication, HR user operations, roles, and audit trail", async () => {
  const goodLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: admin.email, password: "Admin-password-123" },
  });
  assert.equal(goodLogin.status, 200);
  assert.equal(goodLogin.body.data.user.role, "admin");
  assert.equal(Object.hasOwn(goodLogin.body.data.user, "passwordHash"), false);
  adminToken = goodLogin.body.data.token;
  assert.equal(jwt.verify(adminToken, process.env.JWT_SECRET).id, String(admin._id));
  assert.ok((await HcmUser.findById(admin._id)).lastLoginAt);

  const wrongPassword = await request("/api/auth/login", {
    method: "POST",
    body: { email: admin.email, password: "wrong-password" },
  });
  assert.equal(wrongPassword.status, 401);

  const me = await request("/api/auth/me", { token: adminToken });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, admin.email);

  const createdHr = await request("/api/users/hr", {
    method: "POST",
    token: adminToken,
    body: { name: "Test HR", email: `hr-${randomUUID()}@example.test` },
  });
  assert.equal(createdHr.status, 201);
  assert.equal(createdHr.body.data.user.role, "hr");
  assert.equal(createdHr.body.data.user.mustChangePassword, true);
  hr = createdHr.body.data.user;
  hrTemporaryPassword = createdHr.body.data.temporaryPassword;
  assert.equal(typeof hrTemporaryPassword, "string");
  assert.ok(hrTemporaryPassword.length >= 8);
  assert.equal(Object.hasOwn(createdHr.body.data.user, "passwordHash"), false);

  const hrDbUser = await HcmUser.findById(hr._id).select("+passwordHash");
  assert.equal(await bcrypt.compare(hrTemporaryPassword, hrDbUser.passwordHash), true);
  assert.equal(await Notification.countDocuments({ userId: hr._id, type: "account_created" }), 1);

  const deniedHrCreation = await request("/api/users/hr", {
    method: "POST",
    token: hrTemporaryPassword,
    body: { name: "No Admin", email: "no-admin@example.test" },
  });
  assert.equal(deniedHrCreation.status, 401);

  const hrLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: hr.email, password: hrTemporaryPassword },
  });
  assert.equal(hrLogin.status, 200);
  hrToken = hrLogin.body.data.token;

  const forcedRestriction = await request("/api/audit", { token: hrToken });
  assert.equal(forcedRestriction.status, 403);
  assert.equal(forcedRestriction.body.code, "PASSWORD_CHANGE_REQUIRED");
  assert.equal((await request("/api/auth/me", { token: hrToken })).status, 200);
  assert.equal(
    (
      await request("/api/auth/change-password", {
        method: "POST",
        token: hrToken,
        body: { oldPassword: hrTemporaryPassword, newPassword: hrTemporaryPassword },
      })
    ).status,
    400
  );

  hrChangedPassword = `Changed-${randomUUID()}-Pass`;
  const changed = await request("/api/auth/change-password", {
    method: "POST",
    token: hrToken,
    body: { oldPassword: hrTemporaryPassword, newPassword: hrChangedPassword },
  });
  assert.equal(changed.status, 200);
  assert.equal(changed.body.data.user.mustChangePassword, false);
  assert.equal(Object.hasOwn(changed.body.data.user, "passwordHash"), false);

  const wrongOldPassword = await request("/api/auth/change-password", {
    method: "POST",
    token: hrToken,
    body: { oldPassword: hrTemporaryPassword, newPassword: "Another-new-password" },
  });
  assert.equal(wrongOldPassword.status, 401);
  assert.equal((await request("/api/audit", { token: hrToken })).status, 403);
  assert.equal((await request("/api/audit", { token: hrToken })).status, 403);
  assert.equal((await request("/api/auth/logout", { method: "POST", token: hrToken })).status, 200);

  const users = await request("/api/users?role=hr&page=1&limit=10", { token: adminToken });
  assert.equal(users.status, 200);
  assert.equal(users.body.meta.total, 1);
  assert.equal(users.body.meta.page, 1);
  assert.equal(users.body.data[0].email, hr.email);
  assert.equal(Object.hasOwn(users.body.data[0], "passwordHash"), false);

  const invalidUserQuery = await request("/api/users?limit=101", { token: adminToken });
  assert.equal(invalidUserQuery.status, 400);

  const selfDeactivate = await request(`/api/users/${admin._id}/deactivate`, {
    method: "PATCH",
    token: adminToken,
  });
  assert.equal(selfDeactivate.status, 409);

  const reset = await request(`/api/users/${hr._id}/reset-password`, {
    method: "POST",
    token: adminToken,
  });
  assert.equal(reset.status, 200);
  const resetPassword = reset.body.data.temporaryPassword;
  assert.equal(reset.body.data.user.mustChangePassword, true);
  assert.equal((await request("/api/auth/login", {
    method: "POST",
    body: { email: hr.email, password: hrChangedPassword },
  })).status, 401);

  const resetLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: hr.email, password: resetPassword },
  });
  assert.equal(resetLogin.status, 200);
  hrToken = resetLogin.body.data.token;
  assert.equal(
    (await request("/api/users", { token: hrToken })).body.code,
    "PASSWORD_CHANGE_REQUIRED"
  );

  const activated = await request(`/api/users/${hr._id}/deactivate`, {
    method: "PATCH",
    token: adminToken,
  });
  assert.equal(activated.status, 200);
  assert.equal(activated.body.data.user.isActive, false);
  assert.equal(
    (
      await request("/api/auth/me", {
        token: hrToken,
      })
    ).status,
    401
  );

  const blockedLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: hr.email, password: resetPassword },
  });
  assert.equal(blockedLogin.status, 401);

  const reactivated = await request(`/api/users/${hr._id}/activate`, {
    method: "PATCH",
    token: adminToken,
  });
  assert.equal(reactivated.status, 200);
  assert.equal(reactivated.body.data.user.isActive, true);

  const audit = await request("/api/audit?page=1&limit=100", { token: adminToken });
  assert.equal(audit.status, 200);
  assert.ok(audit.body.meta.total >= 7);
  const actions = audit.body.data.map((entry) => entry.action);
  assert.ok(actions.includes("auth.login"));
  assert.ok(actions.includes("auth.password_changed"));
  assert.ok(actions.includes("user.created"));
  assert.ok(actions.includes("user.password_reset"));
  assert.ok(actions.includes("user.deactivated"));
  assert.ok(actions.includes("user.activated"));

  const filteredAudit = await request(
    `/api/audit?actor=${admin._id}&action=user.created`,
    { token: adminToken }
  );
  assert.equal(filteredAudit.status, 200);
  assert.ok(filteredAudit.body.data.every((entry) => entry.action === "user.created"));
  assert.equal(
    (
      await request("/api/audit?from=2026-12-31&to=2026-01-01", { token: adminToken })
    ).status,
    400
  );

  const forbiddenAuditWrite = await request("/api/audit", {
    method: "DELETE",
    token: adminToken,
  });
  assert.equal(forbiddenAuditWrite.status, 404);
});

test("AI service logs successes and failures and enforces the hourly cap", async () => {
  let receivedMessages;
  const completeChat = async (messages) => {
    receivedMessages = messages;
    return "Hello from a mocked Groq response.";
  };
  const result = await askAssistant({
    user: admin,
    message: "Hello",
    completeChat,
  });

  assert.deepEqual(result, {
    answer: "Hello from a mocked Groq response.",
    toolUsed: null,
    label: "AI-generated",
  });
  assert.equal(receivedMessages[0].role, "system");
  assert.equal(receivedMessages[1].content, "Hello");
  assert.match(receivedMessages[0].content, /no access to company records/);

  const successLog = await AiLog.findOne({ userId: admin._id, question: "Hello" });
  assert.equal(successLog.ok, true);
  assert.equal(successLog.role, "admin");
  assert.equal(successLog.toolUsed, null);
  assert.ok(successLog.ms >= 0);

  await assert.rejects(
    askAssistant({
      user: admin,
      message: "Fail safely",
      completeChat: async () => {
        throw new AppError("Mock provider failure", 502);
      },
    }),
    (error) => error.status === 502
  );
  assert.equal((await AiLog.findOne({ userId: admin._id, question: "Fail safely" })).ok, false);

  await AiLog.insertMany(
    Array.from({ length: 18 }, (_, index) => ({
      userId: admin._id,
      role: "admin",
      question: `limit filler ${index}`,
      ok: true,
      ms: 1,
    }))
  );
  let providerCalled = false;
  await assert.rejects(
    askAssistant({
      user: admin,
      message: "This request must be blocked",
      completeChat: async () => {
        providerCalled = true;
        return "should not run";
      },
    }),
    (error) => error.status === 429
  );
  assert.equal(providerCalled, false);
});

test("Groq chat endpoint validates input and requires an authenticated user", async () => {
  const missingToken = await request("/api/ai/chat", {
    method: "POST",
    body: { message: "Hello" },
  });
  assert.equal(missingToken.status, 401);

  const invalidMessage = await request("/api/ai/chat", {
    method: "POST",
    token: adminToken,
    body: { message: "" },
  });
  assert.equal(invalidMessage.status, 400);
  assert.equal(invalidMessage.body.code, "VALIDATION_ERROR");
});

test("legacy task routes provide complete CRUD and error handling", async () => {
  const title = `Task ${randomUUID()}`;
  const created = await request("/api/tasks", {
    method: "POST",
    body: { title, description: "Original description" },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.title, title);
  const taskId = created.body.data._id;

  const all = await request("/api/tasks");
  assert.ok(all.body.data.some((task) => task._id === taskId));
  assert.equal((await request(`/api/task/${taskId}`)).body.data.title, title);

  const updated = await request(`/api/task/${taskId}`, {
    method: "PUT",
    body: { title: `${title} changed`, status: "completed" },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.status, "completed");
  assert.equal((await request(`/api/task/${taskId}`, { method: "DELETE" })).status, 200);
  assert.equal((await request(`/api/task/${taskId}`)).status, 404);

  const invalidRequests = await captureConsoleErrors(async () => {
    const badTask = await request("/api/tasks", {
      method: "POST",
      body: { status: "invalid" },
    });
    const invalidId = await request("/api/task/not-an-object-id");
    return { badTask, invalidId };
  });
  const { badTask, invalidId } = invalidRequests.result;
  assert.equal(badTask.status, 400);
  assert.equal(invalidId.status, 400);
  assert.equal(invalidRequests.errors.length, 2);
  assert.equal(
    (await request("/api/task/507f1f77bcf86cd799439011", { method: "DELETE" })).status,
    404
  );
});

test("legacy user routes create, hash, authenticate, update, and delete users", async () => {
  const suffix = randomUUID();
  const username = `legacy-${suffix}`;
  const email = `${username}@example.test`;
  const password = "legacy-password-123";
  const created = await request("/api/users", {
    method: "POST",
    token: adminToken,
    body: { username, email, gender: "other", password },
  });
  assert.equal(created.status, 201);
  assert.equal(Object.hasOwn(created.body.data, "password"), false);
  const userId = created.body.data._id;

  const stored = await LegacyUser.findById(userId).select("+password");
  assert.notEqual(stored.password, password);
  assert.equal(await bcrypt.compare(password, stored.password), true);

  const login = await request("/api/login", {
    method: "POST",
    body: { email, password },
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.success, true);
  assert.equal(login.body.data.user._id, userId);
  assert.equal(Object.hasOwn(login.body.data.user, "password"), false);
  assert.equal(jwt.verify(login.body.data.token, process.env.JWT_SECRET).id, userId);

  const duplicateResult = await captureConsoleErrors(() =>
    request("/api/users", {
      method: "POST",
      token: adminToken,
      body: { username: `${username}-other`, email, gender: "other", password },
    })
  );
  const duplicate = duplicateResult.result;
  assert.equal(duplicateResult.errors.length, 1);
  assert.equal(duplicate.status, 409);

  const single = await request(`/api/user/${userId}`);
  assert.equal(single.status, 200);
  assert.equal(single.body.data.email, email);
  assert.equal(Object.hasOwn(single.body.data, "password"), false);

  const updated = await request(`/api/user/${userId}`, {
    method: "PUT",
    body: { username: `${username}-updated` },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.username, `${username}-updated`);
  assert.equal(Object.hasOwn(updated.body.data, "password"), false);

  assert.equal((await request(`/api/user/${userId}`, { method: "DELETE" })).status, 200);
  assert.equal((await request(`/api/user/${userId}`)).status, 404);
  assert.equal(
    (
      await request("/api/login", {
        method: "POST",
        body: { email, password: "wrong-password" },
      })
    ).status,
    401
  );
});

test("login rate limit blocks the eleventh attempt", async () => {
  let firstLimitedAttempt;
  let rejectedAttempts = 0;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const result = await request("/api/auth/login", {
        method: "POST",
        body: { email: `missing-${attempt}@example.test`, password: "wrong-password" },
      });

    if (result.status === 429) {
      firstLimitedAttempt = result;
      break;
    }

    assert.equal(result.status, 401);
    rejectedAttempts += 1;
  }

  assert.ok(rejectedAttempts > 0 && rejectedAttempts <= 10);
  assert.equal(firstLimitedAttempt?.status, 429);
  assert.equal(firstLimitedAttempt?.body.success, false);
});

test("startup admin-from-environment path creates the first admin if none exists", async () => {
  await HcmUser.deleteMany({ role: "admin" });

  const email = `startup-${randomUUID()}@example.test`;
  const password = "startup-admin-password-123";
  const created = await temporaryEnvironment(
    {
      ADMIN_EMAIL: email,
      ADMIN_PASSWORD: password,
      ADMIN_NAME: "Startup Admin",
      COMPANY_NAME: "Startup Test Company",
    },
    () => createAdminFromEnvironment()
  );

  assert.equal(created.email, email);
  assert.equal(created.name, "Startup Admin");
  assert.equal(created.role, "admin");
  const stored = await HcmUser.findById(created._id).select("+passwordHash");
  assert.equal(await bcrypt.compare(password, stored.passwordHash), true);
  assert.equal((await Settings.findOne({ key: "company" })).companyName, "Test Company");
  assert.equal(await createAdminFromEnvironment(), null);
  assert.equal(await HcmUser.countDocuments({ role: "admin" }), 1);
});
