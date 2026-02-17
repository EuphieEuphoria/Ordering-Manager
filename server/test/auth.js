/**
 * @file /auth Route Tests
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Load Libraries
import request from "supertest";
import { use, should, expect } from "chai";
import chaiJsonSchemaAjv from "chai-json-schema-ajv";
import chaiShallowDeepEqual from "chai-shallow-deep-equal";
import sinon from "sinon";
import jsonwebtoken from "jsonwebtoken";
use(chaiJsonSchemaAjv.create({ verbose: true }));
use(chaiShallowDeepEqual);

// Import Express application
import app from "../app.js";

// Import Database
import { User, Role } from "../models/models.js";

// Modify Object.prototype for BDD style assertions
should();

// Regular expression to match the expected cookie
const regex_valid = "^" + process.env.SESSION_NAME + "=\\S*; Path=/; HttpOnly$";

/**
 * Test Bypass authentication
 */
const bypassAuth = (user) => {
  it("should allow bypass login with user " + user, (done) => {
    const re = new RegExp(regex_valid, "gm");
    request(app)
      .get("/auth/bypass?token=" + user)
      .expect(302)
      .expect("Location", "/")
      .expect("set-cookie", re)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
};

// List of existing users to be tested
const users = ["admin", "contributor", "manager", "user"];

/**
 * Test Bypass authentication creates user
 */
const bypassAuthCreatesUser = (user) => {
  it("should allow bypass login with new user " + user, (done) => {
    const re = new RegExp(regex_valid, "gm");
    request(app)
      .get("/auth/bypass?token=" + user)
      .expect(302)
      .expect("Location", "/")
      .expect("set-cookie", re)
      .end((err) => {
        if (err) return done(err);
        User.findOne({
          attributes: ["id", "username"],
          where: { username: user },
        }).then((found_user) => {
          expect(found_user).to.not.equal(null);
          found_user.should.have.property("username");
          expect(found_user.username).to.equal(user);
          done();
        });
      });
  });
};

/**
 * Test CAS authentication redirect
 */
const casAuthRedirect = () => {
  it("should redirect users to CAS server", (done) => {
    const expectedURL =
      process.env.CAS_URL +
      "/login?service=" +
      encodeURIComponent(process.env.CAS_SERVICE_URL + "/auth/cas");
    request(app)
      .get("/auth/cas")
      .expect(302)
      .expect("Location", expectedURL)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
};

/**
 * Helper function to generate a valid mock CAS 2.0 Ticket
 */
const validTicket = (user, ticket) => {
  return {
    text: () => {
      return `<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
            <cas:authenticationSuccess>
                <cas:user>${user}</cas:user>
                <cas:ksuPersonWildcatID>${123456789}</cas:ksuPersonWildcatID>
                <cas:proxyGrantingTicket>${ticket}</cas:proxyGrantingTicket>
            </cas:authenticationSuccess>
          </cas:serviceResponse>`;
    },
  };
};

/**
 * Test CAS with valid ticket
 */
const casAuthValidTicket = (user) => {
  it("should log in user " + user + " via CAS", (done) => {
    const ticket = "abc123";
    const fetchStub = sinon
      .stub(global, "fetch")
      .resolves(validTicket(user, ticket));
    const re = new RegExp(regex_valid, "gm");
    request(app)
      .get("/auth/cas?ticket=" + ticket)
      .expect(302)
      .expect("Location", "/")
      .expect("set-cookie", re)
      .end((err) => {
        if (err) return done(err);
        sinon.assert.calledOnce(fetchStub);
        expect(fetchStub.args[0][0]).to.contain("?ticket=" + ticket);
        done();
      });
  });
};

/**
 * Test CAS creates user
 */
const casAuthValidTicketCreatesUser = (user) => {
  it("should create new user " + user + " via CAS", (done) => {
    const ticket = "abc123";
    const fetchStub = sinon
      .stub(global, "fetch")
      .resolves(validTicket(user, ticket));
    const re = new RegExp(regex_valid, "gm");
    request(app)
      .get("/auth/cas?ticket=" + ticket)
      .expect(302)
      .expect("Location", "/")
      .expect("set-cookie", re)
      .end((err) => {
        if (err) return done(err);
        sinon.assert.calledOnce(fetchStub);
        expect(fetchStub.args[0][0]).to.contain("?ticket=" + ticket);
        User.findOne({
          attributes: ["id", "username"],
          where: { username: user },
        }).then((found_user) => {
          expect(found_user).to.not.equal(null);
          found_user.should.have.property("username");
          expect(found_user.username).to.equal(user);
          done();
        });
      });
  });
};

/**
 * Test user can request a valid token
 */
const userCanRequestToken = (user) => {
  it("should allow user " + user + " to request valid JWT", (done) => {
    const re = new RegExp(regex_valid, "gm");
    const agent = request.agent(app);
    agent
      .get("/auth/bypass?token=" + user)
      .expect(302)
      .expect("Location", "/")
      .expect("set-cookie", re)
      .end((err) => {
        if (err) return done(err);
        agent
          .get("/auth/token")
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            res.body.should.be.an("object");
            res.body.should.have.property("token");
            const token = jsonwebtoken.decode(res.body.token);
            token.should.have.property("username");
            token.username.should.be.equal(user);
            done();
          });
      });
  });
};

/**
 * Test user roles are correctly listed in token
 */
const userRolesAreCorrectInToken = (user) => {
  it("should contain correct roles for user " + user + " in JWT", (done) => {
    const re = new RegExp(regex_valid, "gm");
    const agent = request.agent(app);
    agent
      .get("/auth/bypass?token=" + user)
      .expect(302)
      .expect("Location", "/")
      .expect("set-cookie", re)
      .end((err) => {
        if (err) return done(err);
        agent
          .get("/auth/token")
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            res.body.should.be.an("object");
            res.body.should.have.property("token");
            const token = jsonwebtoken.decode(res.body.token);
            User.findOne({
              attributes: ["id", "username"],
              include: {
                model: Role,
                as: "roles",
                attributes: ["id", "role"],
                through: {
                  attributes: [],
                },
              },
              where: { username: user },
            }).then((user) => {
              if (user.roles.length != 0) {
                token.should.have.property("roles");
                expect(token.roles.length).to.equal(user.roles.length);
                user.roles.forEach((expected_role) => {
                  expect(
                    token.roles.some((role) => role.id == expected_role.id),
                  ).to.equal(true);
                });
              } else {
                token.should.not.have.property("roles");
              }
              done();
            });
          });
      });
  });
};

/**
 * User must have a valid session to request a token
 */
const mustBeLoggedInToRequestToken = () => {
  it("should not allow a user to request a token without logging in", (done) => {
    request(app)
      .get("/auth/token")
      .expect(401)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
};

// Regular expression to match deleting the cookie
const regex_destroy =
  "^" +
  process.env.SESSION_NAME +
  "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT$";

/**
 * Logout will remove the cookie
 */
const logoutDestroysCookie = (user) => {
  it("should remove the cookie on logout", (done) => {
    const re = new RegExp(regex_valid, "gm");
    const re_destroy = new RegExp(regex_destroy, "gm");
    const agent = request.agent(app);
    agent
      .get("/auth/bypass?token=" + user)
      .expect(302)
      .expect("Location", "/")
      .expect("set-cookie", re)
      .end((err) => {
        if (err) return done(err);
        agent
          .get("/auth/logout")
          .expect(302)
          .expect("set-cookie", re_destroy)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });
  });
};

// Regular expression for redirecting to CAS
const regex_redirect = "^" + process.env.CAS_URL + "/logout\\?service=\\S*$";

/**
 * Logout redirects to CAS
 */
const logoutRedirectsToCas = (user) => {
  it("should redirect to CAS on logout", (done) => {
    const re = new RegExp(regex_valid, "gm");
    const re_redirect = new RegExp(regex_redirect, "gm");
    const agent = request.agent(app);
    agent
      .get("/auth/bypass?token=" + user)
      .expect(302)
      .expect("Location", "/")
      .expect("set-cookie", re)
      .end((err) => {
        if (err) return done(err);
        agent
          .get("/auth/logout")
          .expect(302)
          .expect("Location", re_redirect)
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });
  });
};

/**
 * Logout prevents requesting a token
 */
const logoutPreventsToken = (user) => {
  it("should prevent access to token after logging out", (done) => {
    const re = new RegExp(regex_valid, "gm");
    const agent = request.agent(app);
    agent
      .get("/auth/bypass?token=" + user)
      .expect(302)
      .expect("Location", "/")
      .expect("set-cookie", re)
      .end((err) => {
        if (err) return done(err);
        agent
          .get("/auth/token")
          .expect(200)
          .end((err) => {
            if (err) return done(err);
            agent
              .get("/auth/logout")
              .expect(302)
              .end((err) => {
                if (err) return done(err);
                agent
                  .get("/auth/token")
                  .expect(401)
                  .end((err) => {
                    if (err) return done(err);
                    done();
                  });
              });
          });
      });
  });
};

/**
 * Test /auth/ routes
 */
describe("/auth", () => {
  describe("GET /bypass", () => {
    users.forEach((user) => {
      bypassAuth(user);
    });
    bypassAuthCreatesUser("testuser");
  });
  describe("GET /cas", () => {
    casAuthRedirect();
    users.forEach((user) => {
      casAuthValidTicket(user);
    });
    casAuthValidTicketCreatesUser("testuser");
  });
  describe("GET /token", () => {
    users.forEach((user) => {
      userCanRequestToken(user);
    });
    userCanRequestToken("testuser");
    userRolesAreCorrectInToken("testuser");
    mustBeLoggedInToRequestToken();
  });
  describe("GET /logout", () => {
    logoutDestroysCookie("admin");
    logoutRedirectsToCas("admin");
    logoutPreventsToken("admin");
  });
});
