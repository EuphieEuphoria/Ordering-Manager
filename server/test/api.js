/**
 * @file /api Route Tests
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Load Libraries
import request from "supertest";
import { use, should } from "chai";
import chaiJsonSchemaAjv from "chai-json-schema-ajv";
import chaiShallowDeepEqual from "chai-shallow-deep-equal";
use(chaiJsonSchemaAjv.create({ verbose: true }));
use(chaiShallowDeepEqual);

// Import Express application
import app from "../app.js";

// Modify Object.prototype for BDD style assertions
should();

/**
 * Get all API versions
 */
const getAllVersions = () => {
  it("should list all API versions", (done) => {
    request(app)
      .get("/api/")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(1);
        done();
      });
  });
};

/**
 * Check JSON Schema of API Versions
 */
const getAllVersionsSchemaMatch = () => {
  it("all API versions should match schema", (done) => {
    const schema = {
      type: "array",
      items: {
        type: "object",
        required: ["version", "url"],
        properties: {
          version: { type: "string" },
          url: { type: "string" },
        },
        additionalProperties: false,
      },
    };
    request(app)
      .get("/api/")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.jsonSchema(schema);
        done();
      });
  });
};

/**
 * Check API version exists in list
 */
const findVersion = (version) => {
  it("should contain specific version", (done) => {
    request(app)
      .get("/api/")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const foundVersion = res.body.find(
          (v) => v.version === version.version,
        );
        foundVersion.should.shallowDeepEqual(version);
        done();
      });
  });
};

/**
 * Test /api route
 */
describe("/api", () => {
  describe("GET /", () => {
    getAllVersions();
    getAllVersionsSchemaMatch();
  });

  describe("version: 1.0", () => {
    const version = {
      version: "1.0",
      url: "/api/v1/",
    };

    describe("GET /", () => {
      findVersion(version);
    });
  });
});
