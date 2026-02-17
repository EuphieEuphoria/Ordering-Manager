/**
 * @file Unit Test Helpers
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import request from "supertest";
import app from "../app.js";
import { expect } from "chai";
import sinon from "sinon";

export const login = async (user) => {
  const agent = request.agent(app);
  return agent.get("/auth/bypass?token=" + user).then(() => {
    return agent
      .get("/auth/token")
      .expect(200)
      .then((res) => {
        return res.body.token;
      });
  });
};

/**
 * Iterate through the router stack of an Express app to find a matching middleware function
 * attached to a particular path and/or method
 *
 * @param {string} name the name of the function to find
 * @param {string} path the path of the endpoint
 * @param {string} method the HTTP method of the endpoint
 * @param {Router} router The Express router to search
 * @returns
 */
const findMiddlewareFunction = (name, path, method, router = app._router) => {
  for (const layer of router.stack) {
    // Return if the middleware function is found
    if (layer.name === name) {
      return layer.handle;
    } else {
      if (layer.match(path)) {
        // Recurse into a router
        if (layer.name === "router" && layer.path.length > 0) {
          // Remove matching portion of path
          path = path.slice(layer.path.length);
          return findMiddlewareFunction(name, path, method, layer.handle);
        }
        // Find matching handler
        if (layer.route && layer.route.methods[method]) {
          return findMiddlewareFunction(name, path, method, layer.route);
        }
      }
    }
  }
  return null;
};

/**
 * Test if a role is able to access the route via the roleAuthMiddleware function
 *
 * @param {string} path the path of the endpoint
 * @param {string} method the HTTP method of the endpoint
 * @param {string} role the role to search for
 * @param {boolean} allowed whether the role should be allowed to access the route
 */
export const testRoleBasedAuth = (path, method, role, allowed) => {
  it(
    "should role '" +
      role +
      "' access '" +
      method +
      " " +
      path +
      "': " +
      allowed,
    (done) => {
      // Mock Express Request object with token attached
      const req = {
        token: {
          username: "test",
          roles: [
            {
              role: role,
            },
          ],
        },
      };

      // Mock Express Response object
      const res = {
        status: sinon.stub(),
        send: sinon.stub(),
      };
      res.status.returns(res);

      // Mock Express Next Middleware function
      const next = sinon.stub();

      // Find the middleware function in the router stack for the given path and method
      const middleware = findMiddlewareFunction(
        "roleAuthMiddleware",
        path,
        method,
      );
      expect(middleware).to.not.equal(null);

      // Call the middleware function
      middleware(req, res, next);

      if (allowed) {
        // If allowed, expect the `next` function to be called
        expect(next.calledOnce).to.equal(true);
      } else {
        // Otherwise, it should send a 401 response
        expect(res.status.calledWith(401)).to.equal(true);
      }
      done();
    },
  );
};

// List of global roles
export const all_roles = [
  "manage_users",
  "manage_documents",
  "add_documents",
  "manage_communities",
  "add_communities",
  "view_documents",
  "view_communities",
];
