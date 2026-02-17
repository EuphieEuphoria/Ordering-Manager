/**
 * @file /api/v1/users Route Tests
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

// User Schema
const userSchema = {
  type: "object",
  required: ["id", "username"],
  properties: {
    id: { type: "number" },
    username: { type: "string" },
    createdAt: { type: "string", format: "iso-date-time" },
    updatedAt: { type: "string", format: "iso-date-time" },
    roles: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "role"],
        properties: {
          id: { type: "number" },
          role: { type: "string" },
        },
      },
    },
  },
  additionalProperties: false,
};

/**
 * Get all Users
 */
const getAllUsers = (state) => {
  it("should list all users", (done) => {
    request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(4);
        done();
      });
  });
};

/**
 * Check JSON Schema of Users
 */
const getUsersSchemaMatch = (state) => {
  it("all users should match schema", (done) => {
    const schema = {
      type: "array",
      items: userSchema,
    };
    request(app)
      .get("/api/v1/users")
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
 * Check User exists in list
 */
const findUser = (state, user) => {
  it("should contain '" + user.username + "' user", (done) => {
    request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const foundUser = res.body.find((u) => u.id === user.id);
        foundUser.should.shallowDeepEqual(user);
        done();
      });
  });
};

/**
 * Check that User has correct number of roles
 */
const findUserCountRoles = (state, username, count) => {
  it("user '" + username + "' should have " + count + " roles", (done) => {
    request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const foundUser = res.body.find((u) => u.username === username);
        foundUser.roles.should.be.an("array");
        foundUser.roles.should.have.lengthOf(count);
        done();
      });
  });
};

/**
 * Check that User has specific role
 */
const findUserConfirmRole = (state, username, role) => {
  it("user '" + username + "' should have '" + role + "' role", (done) => {
    request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const foundUser = res.body.find((u) => u.username === username);
        expect(foundUser.roles.some((r) => r.role === role)).to.equal(true);
        done();
      });
  });
};

/**
 * Creates a user successfully
 */
const createUser = (state, user) => {
  it("should successfully create a user '" + user.username + "'", (done) => {
    request(app)
      .post("/api/v1/users/")
      .set("Authorization", `Bearer ${state.token}`)
      .send(user)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        const created_id = res.body.id;
        // Find user in list of all users
        request(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundUser = res.body.find((u) => u.id === created_id);
            foundUser.should.shallowDeepEqual(user);
            done();
          });
      });
  });
};

/**
 * Fails to create user with missing required attribute
 */
const createUserFailsOnMissingRequiredAttribute = (state, user, attr) => {
  it(
    "should fail when required attribute '" + attr + "' is missing",
    (done) => {
      // Create a copy of the user object and delete the given attribute
      const updated_user = { ...user };
      delete updated_user[attr];
      request(app)
        .post("/api/v1/users/")
        .set("Authorization", `Bearer ${state.token}`)
        .send(updated_user)
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
 * Fails to create user with a duplicate username
 */
const createUserFailsOnDuplicateUsername = (state, user) => {
  it("should fail on duplicate username '" + user.username + "'", (done) => {
    request(app)
      .post("/api/v1/users/")
      .set("Authorization", `Bearer ${state.token}`)
      .send(user)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        const created_id = res.body.id;
        // Find user in list of all users
        request(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundUser = res.body.find((u) => u.id === created_id);
            foundUser.should.shallowDeepEqual(user);
            // Try to create same user again
            request(app)
              .post("/api/v1/users/")
              .set("Authorization", `Bearer ${state.token}`)
              .send(user)
              .expect(422)
              .end((err, res) => {
                if (err) return done(err);
                res.body.should.be.an("object");
                res.body.should.have.property("error");
                res.body.should.have.property("errors");
                res.body.errors.should.be.an("array");
                // the error should be related to the username attribute
                expect(
                  res.body.errors.some((e) => e.attribute === "username"),
                ).to.equal(true);
                done();
              });
          });
      });
  });
};

/**
 * Fails to create user with bad role ID
 */
const createUserFailsOnInvalidRole = (state, user, role_id) => {
  it("should fail when invalid role id '" + role_id + "' is used", (done) => {
    // Create a copy of the user object
    const updated_user = { ...user };
    // Make a shallow copy of the roles array
    updated_user.roles = [...user.roles];
    // Add invalid role ID to user object
    updated_user.roles.push({
      id: role_id,
    });
    request(app)
      .post("/api/v1/users/")
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_user)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        // User with invalid roles should not be created
        request(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(
              res.body.some((u) => u.username === updated_user.username),
            ).to.equal(false);
            done();
          });
      });
  });
};

// New user structure for creating users
const new_user = {
  username: "test_user",
  roles: [
    {
      id: 6,
    },
    {
      id: 7,
    },
  ],
};

// New user structure for creating users without roles
const new_user_no_roles = {
  username: "test_user_no_roles",
};

// List of all expected users in the application
const users = [
  {
    id: 1,
    username: "admin",
  },
  {
    id: 2,
    username: "contributor",
  },
  {
    id: 3,
    username: "manager",
  },
  {
    id: 4,
    username: "user",
  },
];

// List of all users and expected roles
const user_roles = [
  {
    username: "admin",
    roles: ["manage_users", "manage_documents", "manage_communities"],
  },
  {
    username: "contributor",
    roles: ["add_documents", "add_communities"],
  },
  {
    username: "manager",
    roles: ["manage_documents", "manage_communities"],
  },
  {
    username: "user",
    roles: ["view_documents", "view_communities"],
  },
];

/**
 * Get single user
 */
const getSingleUser = (state, user) => {
  it("should get user '" + user.username + "'", (done) => {
    request(app)
      .get("/api/v1/users/" + user.id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.shallowDeepEqual(user);
        done();
      });
  });
};

/**
 * Get single user check schema
 */
const getSingleUserSchemaMatch = (state, user) => {
  it("user '" + user.username + "' should match schema", (done) => {
    request(app)
      .get("/api/v1/users/" + user.id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.jsonSchema(userSchema);
        done();
      });
  });
};

/**
 * Tries to get a user using an invalid id
 */
const getSingleUserBadId = (state, invalidId) => {
  it(
    "should return 404 when requesting user with id '" + invalidId + "'",
    (done) => {
      request(app)
        .get("/api/v1/users/" + invalidId)
        .set("Authorization", `Bearer ${state.token}`)
        .expect(404)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    },
  );
};

/**
 * Update a user successfully
 */
const updateUser = (state, id, user) => {
  it(
    "should successfully update user ID '" +
      id +
      "' to '" +
      user.username +
      "'",
    (done) => {
      request(app)
        .put("/api/v1/users/" + id)
        .set("Authorization", `Bearer ${state.token}`)
        .send(user)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("message");
          res.body.should.have.property("id");
          expect(res.body.id).equal(id);
          // Find user in list of all users
          request(app)
            .get("/api/v1/users")
            .set("Authorization", `Bearer ${state.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const foundUser = res.body.find((u) => u.id === id);
              foundUser.should.shallowDeepEqual(user);
              done();
            });
        });
    },
  );
};

/**
 * Update a user and roles successfully
 */
const updateUserAndRoles = (state, id, user) => {
  it("should successfully update user ID '" + id + "' roles", (done) => {
    request(app)
      .put("/api/v1/users/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(user)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        expect(res.body.id).equal(id);
        // Find user in list of all users
        request(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundUser = res.body.find((u) => u.id === id);
            // Handle case where user has no roles assigned
            const roles = user.roles || [];
            foundUser.roles.should.be.an("array");
            foundUser.roles.should.have.lengthOf(roles.length);
            roles.forEach((role) => {
              expect(foundUser.roles.some((r) => r.id === role.id)).to.equal(
                true,
              );
            });
            done();
          });
      });
  });
};

/**
 * Fails to update user with a duplicate username
 */
const updateUserFailsOnDuplicateUsername = (state, id, user) => {
  it("should fail on duplicate username '" + user.username + "'", (done) => {
    request(app)
      .put("/api/v1/users/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(user)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        res.body.should.have.property("errors");
        res.body.errors.should.be.an("array");
        // the error should be related to the username attribute
        expect(
          res.body.errors.some((e) => e.attribute === "username"),
        ).to.equal(true);
        done();
      });
  });
};

/**
 * Fails to update user with bad role ID
 */
const updateUserFailsOnInvalidRole = (state, id, user, role_id) => {
  it("should fail when invalid role id '" + role_id + "' is used", (done) => {
    // Create a copy of the user object
    const updated_user = { ...user };
    // Make a shallow copy of the roles array
    updated_user.roles = [...user.roles];
    // Add invalid role ID to user object
    updated_user.roles.push({
      id: role_id,
    });
    request(app)
      .put("/api/v1/users/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_user)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        // User with invalid roles should not be updated
        request(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(
              res.body.some((u) => u.username === updated_user.username),
            ).to.equal(false);
            done();
          });
      });
  });
};

// Update user structure with duplicate username
const update_user_duplicate_username = {
  username: "admin",
};

// Update user structure with only roles
const update_user_only_roles = {
  roles: [
    {
      id: 6,
    },
    {
      id: 7,
    },
  ],
};

/**
 * Delete a user successfully
 */
const deleteUser = (state, id) => {
  it("should successfully delete user ID '" + id, (done) => {
    request(app)
      .delete("/api/v1/users/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        expect(res.body.id).to.equal(String(id));
        // Ensure user is not found in list of users
        request(app)
          .get("/api/v1/users")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.some((u) => u.id === id)).to.equal(false);
            done();
          });
      });
  });
};

/**
 * Fail to delete a missing user
 */
const deleteUserFailsInvalidId = (state, id) => {
  it("should fail to delete invalid user ID '" + id, (done) => {
    request(app)
      .delete("/api/v1/users/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(404)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
};

/**
 * Test /api/v1/users route
 */
describe("/api/v1/users", () => {
  let state = {};

  beforeEach(async () => {
    state.token = await login("admin");
  });
  describe("GET /", () => {
    getAllUsers(state);
    getUsersSchemaMatch(state);

    users.forEach((u) => {
      findUser(state, u);
    });

    user_roles.forEach((u) => {
      // Check that user has correct number of roles
      findUserCountRoles(state, u.username, u.roles.length);
      u.roles.forEach((r) => {
        // Check that user has each expected role
        findUserConfirmRole(state, u.username, r);
      });
    });

    const allowed_roles = ["manage_users"];
    all_roles.forEach((r) => {
      testRoleBasedAuth("/api/v1/users", "get", r, allowed_roles.includes(r));
    });
  });

  describe("GET /{id}", () => {
    users.forEach((u) => {
      getSingleUser(state, u);
      getSingleUserSchemaMatch(state, u);
    });

    getSingleUserBadId(state, 0);
    getSingleUserBadId(state, "test");
    getSingleUserBadId(state, -1);
    getSingleUserBadId(state, 5);

    const allowed_roles = ["manage_users"];
    all_roles.forEach((r) => {
      testRoleBasedAuth("/api/v1/users/1", "get", r, allowed_roles.includes(r));
    });
  });

  describe("POST /", () => {
    createUser(state, new_user);
    createUser(state, new_user_no_roles);

    createUserFailsOnMissingRequiredAttribute(state, new_user, "username");
    createUserFailsOnDuplicateUsername(state, new_user);

    createUserFailsOnInvalidRole(state, new_user, 0);
    createUserFailsOnInvalidRole(state, new_user, -1);
    createUserFailsOnInvalidRole(state, new_user, 8);
    createUserFailsOnInvalidRole(state, new_user, "test");

    const allowed_roles = ["manage_users"];
    all_roles.forEach((r) => {
      testRoleBasedAuth("/api/v1/users", "post", r, allowed_roles.includes(r));
    });
  });

  describe("PUT /{id}", () => {
    updateUser(state, 3, new_user);
    updateUserAndRoles(state, 3, new_user);
    updateUserAndRoles(state, 2, new_user_no_roles);
    updateUserAndRoles(state, 1, update_user_only_roles);

    updateUserFailsOnDuplicateUsername(
      state,
      2,
      update_user_duplicate_username,
    );
    updateUserFailsOnInvalidRole(state, 4, new_user, 0);
    updateUserFailsOnInvalidRole(state, 4, new_user, -1);
    updateUserFailsOnInvalidRole(state, 4, new_user, 8);
    updateUserFailsOnInvalidRole(state, 4, new_user, "test");

    const allowed_roles = ["manage_users"];
    all_roles.forEach((r) => {
      testRoleBasedAuth("/api/v1/users/1", "put", r, allowed_roles.includes(r));
    });
  });

  describe("DELETE /{id}", () => {
    deleteUser(state, 4);
    deleteUserFailsInvalidId(state, 0);
    deleteUserFailsInvalidId(state, -1);
    deleteUserFailsInvalidId(state, 5);
    deleteUserFailsInvalidId(state, "test");

    const allowed_roles = ["manage_users"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/users/1",
        "delete",
        r,
        allowed_roles.includes(r),
      );
    });
  });
});
