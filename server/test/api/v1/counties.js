/**
 * @file /api/v1/counties Route Tests
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Load Libraries
import request from "supertest";
import { use, should } from "chai";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import chaiJsonSchemaAjv from "chai-json-schema-ajv";
import chaiShallowDeepEqual from "chai-shallow-deep-equal";

// Import Express application
import app from "../../../app.js";

// Import Helpers
import { login, testRoleBasedAuth, all_roles } from "../../helpers.js";

// Configure Chai and AJV
const ajv = new Ajv();
addFormats(ajv);
use(chaiJsonSchemaAjv.create({ ajv, verbose: true }));
use(chaiShallowDeepEqual);

// Modify Object.prototype for BDD style assertions
should();

// Counties Schema
const countySchema = {
  type: "array",
  items: {
    type: "object",
    required: [
      "id",
      "name",
      "code",
      "seat",
      "population",
      "est_year",
      "communities",
    ],
    properties: {
      id: { type: "number" },
      name: { type: "string" },
      code: { type: "string" },
      seat: { type: "string" },
      population: { type: "number" },
      est_year: { type: "number" },
      communities: { type: "array" },
      createdAt: { type: "string", format: "iso-date-time" },
      updatedAt: { type: "string", format: "iso-date-time" },
    },
    additionalProperties: false,
  },
};

/**
 * Get all Counties
 */
const getAllCounties = (state) => {
  it("should list all counties", (done) => {
    request(app)
      .get("/api/v1/counties")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(105);
        done();
      });
  });
};

/**
 * Check JSON Schema of Counties
 */
const getCountiesSchemaMatch = (state) => {
  it("all counties should match schema", (done) => {
    request(app)
      .get("/api/v1/counties")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.jsonSchema(countySchema);
        done();
      });
  });
};

/**
 * Test /api/v1/counties route
 */
describe("/api/v1/counties", () => {
  let state = {};

  beforeEach(async () => {
    state.token = await login("admin");
  });

  describe("GET /", () => {
    getAllCounties(state);
    getCountiesSchemaMatch(state);

    const allowed_roles = [
      "view_communities",
      "manage_communities",
      "add_communities",
    ];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/counties",
        "get",
        r,
        allowed_roles.includes(r),
      );
    });
  });
});
