/**
 * @file /api/v1/documents Route Tests
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Load Libraries
import request from "supertest";
import { use, should, expect } from "chai";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import chaiJsonSchemaAjv from "chai-json-schema-ajv";
import chaiShallowDeepEqual from "chai-shallow-deep-equal";
import fs from "fs";
import path from "path";

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

// Document Schema
const documentSchema = {
  type: "object",
  required: ["id", "display_name", "filename", "size", "type"],
  properties: {
    id: { type: "number" },
    display_name: { type: "string" },
    filename: { type: "string" },
    size: { type: "number" },
    type: { type: "string" },
    createdAt: { type: "string", format: "iso-date-time" },
    updatedAt: { type: "string", format: "iso-date-time" },
  },
  additionalProperties: false,
};

/**
 * Get all Documents
 */
const getAllDocuments = (state) => {
  it("should list all documents", (done) => {
    request(app)
      .get("/api/v1/documents")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(376);
        done();
      });
  });
};

/**
 * Check JSON Schema of Documents
 */
const getDocumentsSchemaMatch = (state) => {
  it("all documents should match schema", (done) => {
    const schema = {
      type: "array",
      items: documentSchema,
    };
    request(app)
      .get("/api/v1/documents")
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
 * Get single document
 */
const getSingleDocument = (state, documentId) => {
  it("Should get Document " + documentId, (done) => {
    request(app)
      .get("/api/v1/documents/" + documentId)
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
 * Get single document check schema
 */
const getSingleDocumentSchemaMatch = (state, documentId) => {
  it("Document " + documentId + " should match schema", (done) => {
    request(app)
      .get("/api/v1/documents/" + documentId)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.jsonSchema(documentSchema);
        done();
      });
  });
};

/**
 * Get single document
 */
const getSingleDocumentBadId = (state, invalidId) => {
  it(
    "should return 404 when requesting document with id " + invalidId,
    (done) => {
      request(app)
        .get("/api/v1/documents/" + invalidId)
        .set("Authorization", `Bearer ${state.token}`)
        .expect(404)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    },
  );
};

const new_document = {
  display_name: "new_document",
};

/**
 * Creates a document successfully
 */
const createDocument = (state, document) => {
  it("should create document '" + document.display_name + "'", (done) => {
    request(app)
      .post("/api/v1/documents")
      .set("Authorization", `Bearer ${state.token}`)
      .send(document)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        const created_id = res.body.id;
        //find document in list of all documents
        request(app)
          .get("/api/v1/documents")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundDocument = res.body.find((c) => c.id === created_id);
            foundDocument.display_name.should.shallowDeepEqual(
              document.display_name,
            );
            done();
          });
      });
  });
};

/**
 * Fails to create document with missing display_name
 */
const createDocumentFailsOnMissingRequiredAttribute = (
  state,
  document,
  attr,
) => {
  it(
    "should fail when required attribute '" + attr + "' is missing",
    (done) => {
      //create copy of document object and delete given attribute
      const updated_document = JSON.parse(JSON.stringify(document));
      delete updated_document[attr];
      request(app)
        .post("/api/v1/documents/")
        .set("Authorization", `Bearer ${state.token}`)
        .send(updated_document)
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
 * Upload a document successfully
 */
const uploadDocument = (state, document_id) => {
  it("should upload document '" + document_id + "'", (done) => {
    const buffer = Buffer.from("test file contents");

    request(app)
      .post("/api/v1/documents/" + document_id + "/upload")
      .set("Authorization", `Bearer ${state.token}`)
      .attach("file", buffer, {
        filename: "test.txt",
        contentType: "text/plain",
      })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        const created_id = res.body.id;
        //find document in list of all documents
        request(app)
          .get("/api/v1/documents")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundDocument = res.body.find((c) => c.id === created_id);
            const multerSaltedFilename = foundDocument.filename;

            // confirm file is in uploads
            const filePath = path.join(
              "./public/uploads",
              multerSaltedFilename,
            );

            fs.access(filePath, fs.constants.F_OK, (err) => {
              expect(err).to.be.null;
              done();
            });
          });
      });
  });
};

/**
 * Upload document fails on invalid id
 */
const uploadDocumentFailsOnInvalidId = (state, document_id) => {
  it(
    "should fail to upload document with invalid id " + document_id,
    (done) => {
      const buffer = Buffer.from("test file contents");
      request(app)
        .post("/api/v1/documents/" + document_id + "/upload")
        .set("Authorization", `Bearer ${state.token}`)
        .attach("file", buffer, {
          filename: "test.txt",
          contentType: "text/plain",
        })
        .expect(404)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    },
  );
};

/**
 * Upload document fails on missing file
 */
const uploadDocumentFailsOnMissingFile = (state, document_id) => {
  it("should fail to upload document with missing file", (done) => {
    request(app)
      .post("/api/v1/documents/" + document_id + "/upload")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(422)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
};

/**
 * Update a document successfully
 */
const updateDocument = (state, document_id, updated_document) => {
  it("should sucessfully update document '" + document_id + "'", (done) => {
    request(app)
      .put("/api/v1/documents/" + document_id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_document)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        expect(res.body.id).equal(document_id);
        //find document in list of documents
        request(app)
          .get("/api/v1/documents")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundDocument = res.body.find((c) => c.id === document_id);
            foundDocument.display_name.should.shallowDeepEqual(
              updated_document.display_name,
            );
            done();
          });
      });
  });
};

/**
 * Update document fails on invalid id
 */
const updateDocumentFailsOnInvalidId = (
  state,
  document_id,
  updated_document,
) => {
  it(
    "should fail to update document with invalid id " + document_id,
    (done) => {
      request(app)
        .put("/api/v1/documents/" + document_id)
        .set("Authorization", `Bearer ${state.token}`)
        .send(updated_document)
        .expect(404)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    },
  );
};

/**
 * Update document fails on missing attribute
 */

const updateDocumentFailsOnMissingAttribute = (
  state,
  document_id,
  updated_document,
  attr,
) => {
  it("should fail to update when missing '" + attr + "'", (done) => {
    //create copy of document object and delete given attribute
    const updated_document_missing_attr = JSON.parse(
      JSON.stringify(updated_document),
    );
    delete updated_document_missing_attr[attr];
    request(app)
      .put("/api/v1/documents/" + document_id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_document_missing_attr)
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
  });
};

/**
 * Delete a Document successfully
 */
const deleteDocument = (state, id) => {
  it("should successfully delete document ID " + id, (done) => {
    request(app)
      .delete("/api/v1/documents/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        expect(res.body.id).to.equal(String(id));
        //ensure document is not found in list of documents
        request(app)
          .get("/api/v1/documents")
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
 * Fail to delete an invalid document
 */
const deleteDocumentFailsInvalidId = (state, id) => {
  it("should successfully delete document ID " + id, (done) => {
    request(app)
      .delete("/api/v1/documents/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(404)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
};

/**
 * Test /api/v1/documents route
 */
describe("/api/v1/documents", () => {
  let state = {};

  beforeEach(async () => {
    state.token = await login("admin");
  });
  describe("GET /", () => {
    getAllDocuments(state);
    getDocumentsSchemaMatch(state);

    const allowed_roles = [
      "view_documents",
      "manage_documents",
      "add_documents",
    ];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/documents",
        "get",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("GET /{id}", () => {
    getSingleDocument(state, 1);
    getSingleDocument(state, 100);
    getSingleDocumentSchemaMatch(state, 1);
    getSingleDocumentSchemaMatch(state, 100);

    getSingleDocumentBadId(state, 0);
    getSingleDocumentBadId(state, -1);
    getSingleDocumentBadId(state, "test");
    getSingleDocumentBadId(state, 1000);

    const allowed_roles = [
      "view_documents",
      "manage_documents",
      "add_documents",
    ];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/documents/1",
        "get",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("POST /", () => {
    createDocument(state, new_document);

    createDocumentFailsOnMissingRequiredAttribute(
      state,
      new_document,
      "display_name",
    );

    const allowed_roles = ["manage_documents", "add_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/documents",
        "post",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("POST /{id}/upload", () => {
    uploadDocument(state, 1);

    uploadDocumentFailsOnInvalidId(state, 0);
    uploadDocumentFailsOnInvalidId(state, -1);
    uploadDocumentFailsOnInvalidId(state, 1000);
    uploadDocumentFailsOnInvalidId(state, "test");

    uploadDocumentFailsOnMissingFile(state, 1);

    const allowed_roles = ["manage_documents", "add_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/documents/1/upload",
        "post",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("PUT /{id}", () => {
    updateDocument(state, 1, new_document);

    updateDocumentFailsOnInvalidId(state, 0, new_document);
    updateDocumentFailsOnInvalidId(state, -1, new_document);
    updateDocumentFailsOnInvalidId(state, 1000, new_document);
    updateDocumentFailsOnInvalidId(state, "test", new_document);

    updateDocumentFailsOnMissingAttribute(
      state,
      1,
      new_document,
      "display_name",
    );

    const allowed_roles = ["manage_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/documents/1",
        "put",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("DELETE /{id}", () => {
    deleteDocument(state, 1);
    deleteDocumentFailsInvalidId(state, 0);
    deleteDocumentFailsInvalidId(state, -1);
    deleteDocumentFailsInvalidId(state, 1000);
    deleteDocumentFailsInvalidId(state, "test");

    const allowed_roles = ["manage_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/documents/1",
        "delete",
        r,
        allowed_roles.includes(r),
      );
    });
  });
});
