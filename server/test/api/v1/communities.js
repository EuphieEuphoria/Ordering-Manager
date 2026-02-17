/**
 * @file /api/v1/communities Route Tests
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Load Libraries
import request from "supertest";
import { use, should, expect } from "chai";
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

// Community Schema
const communitySchema = {
  type: "object",
  required: ["id", "name", "lat", "long", "owner", "county"],
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    lat: { type: "number" },
    long: { type: "number" },
    owner: { type: "object" },
    county: { type: "object" },
    createdAt: { type: "string", format: "iso-date-time" },
    updatedAt: { type: "string", format: "iso-date-time" },
  },
  additionalProperties: false,
};

/**
 * Get all Communities
 */
const getAllCommunities = (state) => {
  it("should list all communities", (done) => {
    request(app)
      .get("/api/v1/communities")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(199);
        done();
      });
  });
};

/**
 * Check JSON Schema of Communities
 */
const getCommunitiesSchemaMatch = (state) => {
  it("all communities should match schema", (done) => {
    const schema = {
      type: "array",
      items: communitySchema,
    };
    request(app)
      .get("/api/v1/communities")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.jsonSchema(schema);
        done();
      });
  });
};

/**
 * Get single community
 */
const getSingleCommunity = (state, communityId) => {
  it("Should get Community " + communityId, (done) => {
    request(app)
      .get("/api/v1/communities/" + communityId)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        done();
      });
  });
};

/**
 * Get single community check schema
 */
const getSingleCommunitySchemaMatch = (state, communityId) => {
  it("Community " + communityId + " should match schema", (done) => {
    request(app)
      .get("/api/v1/communities/" + communityId)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.jsonSchema(communitySchema);
        done();
      });
  });
};

/**
 * Get single community
 */
const getSingleCommunityBadId = (state, invalidId) => {
  it(
    "should return 404 when requesting community with id " + invalidId,
    (done) => {
      request(app)
        .get("/api/v1/communities/" + invalidId)
        .set("Authorization", `Bearer ${state.token}`)
        .expect(404)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    },
  );
};

const new_community = {
  name: "new_community",
  lat: 100,
  long: 50,
  owner: {
    id: 1,
  },
  county: {
    id: 1,
  },
};

/**
 * Creates a community successfully
 */
const createCommunity = (state, community) => {
  it("should create community '" + community.name + "'", (done) => {
    request(app)
      .post("/api/v1/communities")
      .set("Authorization", `Bearer ${state.token}`)
      .send(community)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        const created_id = res.body.id;
        //find community in list of all communities
        request(app)
          .get("/api/v1/communities")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundCommunity = res.body.find((c) => c.id === created_id);
            foundCommunity.should.shallowDeepEqual(community);
            done();
          });
      });
  });
};

/**
 * Fails to create community with missing required attribute
 */
const createCommunityFailsOnMissingRequiredAttribute = (
  state,
  community,
  attr,
) => {
  it(
    "should fail when required attribute '" + attr + "' is missing",
    (done) => {
      //create copy of community object and delete given attribute
      const updated_community = JSON.parse(JSON.stringify(community));
      delete updated_community[attr];
      request(app)
        .post("/api/v1/communities/")
        .set("Authorization", `Bearer ${state.token}`)
        .send(updated_community)
        .expect(422)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("error");
          res.body.should.have.property("errors");
          res.body.errors.should.be.an("array");
          // the error should be related to the deleted attribute
          expect(res.body.errors.some((e) => e.attribute === attr)).to.equal(
            true,
          );
          done();
        });
    },
  );
};

/**
 * Fails to create community with invalid owner
 */
const createCommunityFailsOnInvalidOwner = (state, community, owner) => {
  it("should fail when owner '" + owner + "' is added", (done) => {
    //create copy of community object and delete owner then add new owner
    const updated_community_owner = JSON.parse(JSON.stringify(community));
    updated_community_owner.owner.id = owner;
    request(app)
      .post("/api/v1/communities/")
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_community_owner)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        res.body.should.have.property("errors");
        res.body.errors.should.be.an("array");
        // the error should be related to the deleted attribute
        expect(res.body.errors.some((e) => e.attribute === "owner")).to.equal(
          true,
        );
        done();
      });
  });
};

/**
 * Fails to create community with invalid county
 */
const createCommunityFailsOnInvalidCounty = (state, community, county) => {
  it("should fail when county '" + county + "' is added", (done) => {
    //create copy of community object and delete county then add new county
    const updated_community_county = JSON.parse(JSON.stringify(community));
    updated_community_county.county.id = county;
    request(app)
      .post("/api/v1/communities/")
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_community_county)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        res.body.should.have.property("errors");
        res.body.errors.should.be.an("array");
        // the error should be related to the deleted attribute
        expect(res.body.errors.some((e) => e.attribute === "county")).to.equal(
          true,
        );
        done();
      });
  });
};

/**
 * Update a community successfully
 */
const updateCommunity = (state, community_id, updated_community) => {
  it("should sucessfully update community '" + community_id + "'", (done) => {
    request(app)
      .put("/api/v1/communities/" + community_id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_community)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        expect(res.body.id).equal(community_id);
        //find community in list of communities
        request(app)
          .get("/api/v1/communities")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundCommunity = res.body.find((c) => c.id === community_id);
            foundCommunity.should.shallowDeepEqual(updated_community);
            done();
          });
      });
  });
};

/**
 * Update a community successfully with a missing attribute
 */
const updateCommunityMissingAttribute = (
  state,
  community_id,
  updated_community,
  attr,
) => {
  it(
    "should sucessfully update community '" +
      community_id +
      "' without attr '" +
      attr +
      "'",
    (done) => {
      //create copy of community object and delete given attribute
      const updated_community_missing_attr = JSON.parse(
        JSON.stringify(updated_community),
      );
      delete updated_community_missing_attr[attr];
      request(app)
        .put("/api/v1/communities/" + community_id)
        .set("Authorization", `Bearer ${state.token}`)
        .send(updated_community_missing_attr)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("message");
          res.body.should.have.property("id");
          expect(res.body.id).equal(community_id);
          //find community in list of communities
          request(app)
            .get("/api/v1/communities")
            .set("Authorization", `Bearer ${state.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const foundCommunity = res.body.find(
                (c) => c.id === community_id,
              );
              for (const key in updated_community_missing_attr) {
                if (key !== attr) {
                  foundCommunity.should.have.property(key);
                  if (typeof updated_community_missing_attr[key] === "object") {
                    expect(foundCommunity[key].id).to.equal(
                      updated_community_missing_attr[key].id,
                    );
                  }
                }
              }
              done();
            });
        });
    },
  );
};

/**
 * Update a community successfully with single attribute
 */
const updateCommunityOnlyAttribute = (
  state,
  community_id,
  updated_community,
  attr,
) => {
  it(
    "should sucessfully update community '" +
      community_id +
      "' with attr '" +
      attr +
      "'",
    (done) => {
      //create copy of community object and delete all attr except given attribute
      const updated_community_single_attr = JSON.parse(
        JSON.stringify(updated_community),
      );
      for (const key in updated_community_single_attr) {
        if (key !== attr) {
          delete updated_community_single_attr[key];
        }
      }
      request(app)
        .put("/api/v1/communities/" + community_id)
        .set("Authorization", `Bearer ${state.token}`)
        .send(updated_community_single_attr)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("message");
          res.body.should.have.property("id");
          expect(res.body.id).equal(community_id);
          //find community in list of communities
          request(app)
            .get("/api/v1/communities")
            .set("Authorization", `Bearer ${state.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const foundCommunity = res.body.find(
                (c) => c.id === community_id,
              );
              foundCommunity.should.have.property(attr);
              if (typeof updated_community_single_attr[attr] === "object") {
                expect(foundCommunity[attr].id).to.equal(
                  updated_community_single_attr[attr].id,
                );
              }
              done();
            });
        });
    },
  );
};

/**
 * Fails to update community with invalid owner
 */
const updateCommunityFailsOnInvalidOwner = (
  state,
  community_id,
  community,
  owner,
) => {
  it("should fail when owner '" + owner + "' is updated", (done) => {
    //create copy of community object and delete owner then add new owner
    const updated_community_owner = JSON.parse(JSON.stringify(community));
    updated_community_owner.owner.id = owner;
    request(app)
      .put("/api/v1/communities/" + community_id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_community_owner)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        res.body.should.have.property("errors");
        res.body.errors.should.be.an("array");
        // the error should be related to the deleted attribute
        expect(res.body.errors.some((e) => e.attribute === "owner")).to.equal(
          true,
        );
        done();
      });
  });
};

/**
 * Fails to update community with invalid county
 */
const updateCommunityFailsOnInvalidCounty = (
  state,
  community_id,
  community,
  county,
) => {
  it("should fail when county '" + county + "' is updated", (done) => {
    //create copy of community object and delete county then add new county
    const updated_community_county = JSON.parse(JSON.stringify(community));
    updated_community_county.county.id = county;
    request(app)
      .put("/api/v1/communities/" + community_id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_community_county)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        res.body.should.have.property("errors");
        res.body.errors.should.be.an("array");
        // the error should be related to the deleted attribute
        expect(res.body.errors.some((e) => e.attribute === "county")).to.equal(
          true,
        );
        done();
      });
  });
};

/**
 * Delete a Community successfully
 */
const deleteCommunity = (state, id) => {
  it("should successfully delete community ID " + id, (done) => {
    request(app)
      .delete("/api/v1/communities/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        expect(res.body.id).to.equal(String(id));
        //ensure community is not found in list of communities
        request(app)
          .get("/api/v1/communities")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.some((c) => c.id === id)).to.equal(false);
            done();
          });
      });
  });
};

/**
 * Fail to delete an invalid community
 */
const deleteCommunityFailsInvalidId = (state, id) => {
  it("should successfully delete community ID " + id, (done) => {
    request(app)
      .delete("/api/v1/communities/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(404)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
};

/**
 * Test /api/v1/communities route
 */
describe("/api/v1/communities", () => {
  let state = {};

  beforeEach(async () => {
    state.token = await login("admin");
  });
  describe("GET /", () => {
    getAllCommunities(state);
    getCommunitiesSchemaMatch(state);

    const allowed_roles = [
      "view_communities",
      "manage_communities",
      "add_communities",
    ];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/communities",
        "get",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("GET /{id}", () => {
    getSingleCommunity(state, 1);
    getSingleCommunity(state, 100);
    getSingleCommunitySchemaMatch(state, 1);
    getSingleCommunitySchemaMatch(state, 100);

    getSingleCommunityBadId(state, 0);
    getSingleCommunityBadId(state, -1);
    getSingleCommunityBadId(state, "test");
    getSingleCommunityBadId(state, 1000);

    const allowed_roles = [
      "view_communities",
      "manage_communities",
      "add_communities",
    ];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/communities/1",
        "get",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("POST /", () => {
    createCommunity(state, new_community);

    createCommunityFailsOnMissingRequiredAttribute(
      state,
      new_community,
      "name",
    );
    createCommunityFailsOnMissingRequiredAttribute(state, new_community, "lat");
    createCommunityFailsOnMissingRequiredAttribute(
      state,
      new_community,
      "long",
    );
    // createCommunityFailsOnMissingRequiredAttribute(
    //   state,
    //   new_community,
    //   "owner",
    // );
    createCommunityFailsOnMissingRequiredAttribute(
      state,
      new_community,
      "county",
    );

    // createCommunityFailsOnInvalidOwner(state, new_community, 0);
    // createCommunityFailsOnInvalidOwner(state, new_community, -1);
    // createCommunityFailsOnInvalidOwner(state, new_community, 100);
    // createCommunityFailsOnInvalidOwner(state, new_community, "owner");

    createCommunityFailsOnInvalidCounty(state, new_community, 0);
    createCommunityFailsOnInvalidCounty(state, new_community, -1);
    createCommunityFailsOnInvalidCounty(state, new_community, 1000);
    createCommunityFailsOnInvalidCounty(state, new_community, "county");

    const allowed_roles = ["manage_communities", "add_communities"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/communities",
        "post",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("PUT /", () => {
    updateCommunity(state, 1, new_community);
    updateCommunityMissingAttribute(state, 1, new_community, "name");
    updateCommunityMissingAttribute(state, 1, new_community, "lat");
    updateCommunityMissingAttribute(state, 1, new_community, "long");
    updateCommunityMissingAttribute(state, 1, new_community, "owner");
    updateCommunityMissingAttribute(state, 1, new_community, "county");

    updateCommunityOnlyAttribute(state, 2, new_community, "name");
    updateCommunityOnlyAttribute(state, 2, new_community, "lat");
    updateCommunityOnlyAttribute(state, 2, new_community, "long");
    updateCommunityOnlyAttribute(state, 2, new_community, "owner");
    updateCommunityOnlyAttribute(state, 2, new_community, "county");

    // updateCommunityFailsOnInvalidOwner(state, 3, new_community, 0);
    // updateCommunityFailsOnInvalidOwner(state, 3, new_community, -1);
    // updateCommunityFailsOnInvalidOwner(state, 3, new_community, 100);
    // updateCommunityFailsOnInvalidOwner(state, 3, new_community, "owner");

    updateCommunityFailsOnInvalidCounty(state, 3, new_community, 0);
    updateCommunityFailsOnInvalidCounty(state, 3, new_community, -1);
    updateCommunityFailsOnInvalidCounty(state, 3, new_community, 1000);
    updateCommunityFailsOnInvalidCounty(state, 3, new_community, "owner");

    const allowed_roles = ["manage_communities"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/communities/1",
        "put",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("DELETE /", () => {
    deleteCommunity(state, 1);
    deleteCommunityFailsInvalidId(state, 0);
    deleteCommunityFailsInvalidId(state, -1);
    deleteCommunityFailsInvalidId(state, 1000);
    deleteCommunityFailsInvalidId(state, "test");

    const allowed_roles = ["manage_communities"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/communities/1",
        "delete",
        r,
        allowed_roles.includes(r),
      );
    });
  });
});
