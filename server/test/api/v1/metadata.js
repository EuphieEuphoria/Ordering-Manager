/**
 * @file /api/v1/metadata Route Tests
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

// Metadata Schema
const metadataSchema = {
  type: "object",
  required: [
    "id",
    "title",
    "author",
    "publisher",
    "date",
    "abstract",
    "citation",
    "copyright_id",
    "keywords",
    "owner",
    "communities",
    "documents",
  ],
  properties: {
    id: { type: "number" },
    title: { type: "string" },
    author: { type: "string" },
    publisher: { type: "string" },
    date: { type: "string" },
    abstract: { type: "string" },
    citation: { type: "string" },
    copyright_id: { type: "number" },
    keywords: { type: "string" },
    owner: { type: "object" },
    communities: { type: "array" },
    documents: { type: "array" },
    createdAt: { type: "string", format: "iso-date-time" },
    updatedAt: { type: "string", format: "iso-date-time" },
  },
  additionalProperties: false,
};

/**
 * Get all Metadata
 */
const getAllMetadata = (state) => {
  it("should list all metadata", (done) => {
    request(app)
      .get("/api/v1/metadata")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("array");
        res.body.should.have.lengthOf(176);
        done();
      });
  });
};

/**
 * Check JSON Schema of Metadata
 */
const getMetadataSchemaMatch = (state) => {
  it("all metadata should match schema", (done) => {
    const schema = {
      type: "array",
      items: metadataSchema,
    };
    request(app)
      .get("/api/v1/metadata")
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
 * Get single metadata
 */
const getSingleMetadata = (state, metadataId) => {
  it("Should get Metadata " + metadataId, (done) => {
    request(app)
      .get("/api/v1/metadata/" + metadataId)
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
 * Get single metadata check schema
 */
const getSingleMetadataSchemaMatch = (state, metadataId) => {
  it("Metadata " + metadataId + " should match schema", (done) => {
    request(app)
      .get("/api/v1/metadata/" + metadataId)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.jsonSchema(metadataSchema);
        done();
      });
  });
};

/**
 * Get single metadata
 */
const getSingleMetadataBadId = (state, invalidId) => {
  it(
    "should return 404 when requesting metadata with id " + invalidId,
    (done) => {
      request(app)
        .get("/api/v1/metadata/" + invalidId)
        .set("Authorization", `Bearer ${state.token}`)
        .expect(404)
        .end((err) => {
          if (err) return done(err);
          done();
        });
    },
  );
};

const new_metadata = {
  title: "new_metadata",
  author: "new_author",
  publisher: "new_publisher",
  date: "2025",
  abstract: "new_abstract",
  citation: "new_citation",
  copyright_id: 1,
  keywords: "new_keywords",
  owner: {
    id: 1,
  },
};

/**
 * Creates a metadata successfully
 */
const createMetadata = (state, metadata) => {
  it("should create metadata '" + metadata.title + "'", (done) => {
    request(app)
      .post("/api/v1/metadata")
      .set("Authorization", `Bearer ${state.token}`)
      .send(metadata)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        const created_id = res.body.id;
        //find metadata in list of all metadata
        request(app)
          .get("/api/v1/metadata")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundMetadata = res.body.find((c) => c.id === created_id);
            foundMetadata.should.shallowDeepEqual(metadata);
            done();
          });
      });
  });
};

/**
 * Fails to create metadata with missing required attribute
 */
const createMetadataFailsOnMissingRequiredAttribute = (
  state,
  metadata,
  attr,
) => {
  it(
    "should fail when required attribute '" + attr + "' is missing",
    (done) => {
      //create copy of metadata object and delete given attribute
      const updated_metadata = JSON.parse(JSON.stringify(metadata));
      delete updated_metadata[attr];
      request(app)
        .post("/api/v1/metadata/")
        .set("Authorization", `Bearer ${state.token}`)
        .send(updated_metadata)
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
 * Fails to create metadata with invalid owner
 */
const createMetadataFailsOnInvalidOwner = (state, metadata, owner) => {
  it("should fail when owner '" + owner + "' is added", (done) => {
    //create copy of metadata object and delete owner then add new owner
    const updated_metadata_owner = JSON.parse(JSON.stringify(metadata));
    updated_metadata_owner.owner.id = owner;
    request(app)
      .post("/api/v1/metadata/")
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_metadata_owner)
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
 * Add a document to metadata successfully
 */
const addDocumentToMetadata = (state, metadata_id, document_id) => {
  it(
    "should add document '" +
      document_id +
      "' to metadata '" +
      metadata_id +
      "'",
    (done) => {
      request(app)
        .post("/api/v1/metadata/" + metadata_id + "/add_document/")
        .set("Authorization", `Bearer ${state.token}`)
        .send({ id: document_id })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("message");
          res.body.should.have.property("id");
          const updated_id = res.body.id;
          //find metadata in list of all metadata
          request(app)
            .get("/api/v1/metadata")
            .set("Authorization", `Bearer ${state.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const foundMetadata = res.body.find((c) => c.id === updated_id);
              foundMetadata.should.have.property("documents");
              expect(
                foundMetadata.documents.some((d) => d.id === document_id),
              ).to.equal(true);
              done();
            });
        });
    },
  );
};

/**
 * Fails to add a document to metadata with missing document id
 */
const addDocumentToMetadataFailsOnMissingDocumentId = (state, metadata_id) => {
  it("should fail when document id is missing", (done) => {
    request(app)
      .post("/api/v1/metadata/" + metadata_id + "/add_document/")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        res.body.should.have.property("errors");
        res.body.errors.should.be.an("array");
        // the error should be related to the deleted attribute
        expect(
          res.body.errors.some((e) => e.attribute === "document_Id"),
        ).to.equal(true);
        done();
      });
  });
};

/**
 * Fails to add a document to metadata with invalid id
 */
const addDocumentToMetadataFailsOnInvalidId = (
  state,
  metadata_id,
  document_id,
) => {
  it(
    "should fail when adding document '" +
      document_id +
      "' to metadata '" +
      metadata_id +
      "'",
    (done) => {
      request(app)
        .post("/api/v1/metadata/" + metadata_id + "/add_document/")
        .set("Authorization", `Bearer ${state.token}`)
        .send({ id: document_id })
        .expect(422)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("error");
          res.body.should.have.property("errors");
          res.body.errors.should.be.an("array");
          // the error should be related to the deleted attribute
          expect(
            res.body.errors.some((e) => e.attribute === "document_Id"),
          ).to.equal(true);
          done();
        });
    },
  );
};

/**
 * Remove a document from metadata successfully
 */
const removeDocumentFromMetadata = (state, metadata_id, document_id) => {
  it(
    "should remove document '" +
      document_id +
      "' from metadata '" +
      metadata_id +
      "'",
    (done) => {
      request(app)
        .post("/api/v1/metadata/" + metadata_id + "/remove_document/")
        .set("Authorization", `Bearer ${state.token}`)
        .send({ id: document_id })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("message");
          res.body.should.have.property("id");
          const updated_id = res.body.id;
          //find metadata in list of all metadata
          request(app)
            .get("/api/v1/metadata")
            .set("Authorization", `Bearer ${state.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const foundMetadata = res.body.find((c) => c.id === updated_id);
              foundMetadata.should.have.property("documents");
              expect(
                foundMetadata.documents.some((d) => d.id === document_id),
              ).to.equal(false);
              done();
            });
        });
    },
  );
};

/**
 * Fails to remove a document from metadata with missing document id
 */
const removeDocumentFromMetadataFailsOnMissingDocumentId = (
  state,
  metadata_id,
) => {
  it("should fail when document id is missing", (done) => {
    request(app)
      .post("/api/v1/metadata/" + metadata_id + "/remove_document/")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        res.body.should.have.property("errors");
        res.body.errors.should.be.an("array");
        // the error should be related to the deleted attribute
        expect(
          res.body.errors.some((e) => e.attribute === "document_Id"),
        ).to.equal(true);
        done();
      });
  });
};

/**
 * Fails to remove a document from metadata with invalid id
 */
const removeDocumentFromMetadataFailsOnInvalidId = (
  state,
  metadata_id,
  document_id,
) => {
  it(
    "should fail when removing document '" +
      document_id +
      "' from metadata '" +
      metadata_id +
      "'",
    (done) => {
      request(app)
        .post("/api/v1/metadata/" + metadata_id + "/remove_document/")
        .set("Authorization", `Bearer ${state.token}`)
        .send({ id: document_id })
        .expect(422)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("error");
          res.body.should.have.property("errors");
          res.body.errors.should.be.an("array");
          // the error should be related to the deleted attribute
          expect(
            res.body.errors.some((e) => e.attribute === "document_Id"),
          ).to.equal(true);
          done();
        });
    },
  );
};

/**
 * Add a community to metadata successfully
 */
const addCommunityToMetadata = (state, metadata_id, community_id) => {
  it(
    "should add community '" +
      community_id +
      "' to metadata '" +
      metadata_id +
      "'",
    (done) => {
      request(app)
        .post("/api/v1/metadata/" + metadata_id + "/add_community/")
        .set("Authorization", `Bearer ${state.token}`)
        .send({ id: community_id })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("message");
          res.body.should.have.property("id");
          const updated_id = res.body.id;
          //find metadata in list of all metadata
          request(app)
            .get("/api/v1/metadata")
            .set("Authorization", `Bearer ${state.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const foundMetadata = res.body.find((c) => c.id === updated_id);
              foundMetadata.should.have.property("communities");
              expect(
                foundMetadata.communities.some((c) => c.id === community_id),
              ).to.equal(true);
              done();
            });
        });
    },
  );
};

/**
 * Fails to add a community to metadata with missing community id
 */
const addCommunityToMetadataFailsOnMissingCommunityId = (
  state,
  metadata_id,
) => {
  it("should fail when community id is missing", (done) => {
    request(app)
      .post("/api/v1/metadata/" + metadata_id + "/add_community/")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        res.body.should.have.property("errors");
        res.body.errors.should.be.an("array");
        // the error should be related to the deleted attribute
        expect(
          res.body.errors.some((e) => e.attribute === "community_Id"),
        ).to.equal(true);
        done();
      });
  });
};

/**
 * Fails to add a community to metadata with invalid id
 */
const addCommunityToMetadataFailsOnInvalidId = (
  state,
  metadata_id,
  community_id,
) => {
  it(
    "should fail when adding community '" +
      community_id +
      "' to metadata '" +
      metadata_id +
      "'",
    (done) => {
      request(app)
        .post("/api/v1/metadata/" + metadata_id + "/add_community/")
        .set("Authorization", `Bearer ${state.token}`)
        .send({ id: community_id })
        .expect(422)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("error");
          res.body.should.have.property("errors");
          res.body.errors.should.be.an("array");
          // the error should be related to the deleted attribute
          expect(
            res.body.errors.some((e) => e.attribute === "community_Id"),
          ).to.equal(true);
          done();
        });
    },
  );
};

/**
 * Remove a community from metadata successfully
 */
const removeCommunityFromMetadata = (state, metadata_id, community_id) => {
  it(
    "should remove community '" +
      community_id +
      "' from metadata '" +
      metadata_id +
      "'",
    (done) => {
      request(app)
        .post("/api/v1/metadata/" + metadata_id + "/remove_community/")
        .set("Authorization", `Bearer ${state.token}`)
        .send({ id: community_id })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("message");
          res.body.should.have.property("id");
          const updated_id = res.body.id;
          //find metadata in list of all metadata
          request(app)
            .get("/api/v1/metadata")
            .set("Authorization", `Bearer ${state.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const foundMetadata = res.body.find((c) => c.id === updated_id);
              foundMetadata.should.have.property("communities");
              expect(
                foundMetadata.communities.some((c) => c.id === community_id),
              ).to.equal(false);
              done();
            });
        });
    },
  );
};

/**
 * Fails to remove a community from metadata with missing community id
 */
const removeCommunityFromMetadataFailsOnMissingCommunityId = (
  state,
  metadata_id,
) => {
  it("should fail when community id is missing", (done) => {
    request(app)
      .post("/api/v1/metadata/" + metadata_id + "/remove_community/")
      .set("Authorization", `Bearer ${state.token}`)
      .expect(422)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("error");
        res.body.should.have.property("errors");
        res.body.errors.should.be.an("array");
        // the error should be related to the deleted attribute
        expect(
          res.body.errors.some((e) => e.attribute === "community_Id"),
        ).to.equal(true);
        done();
      });
  });
};

/**
 * Fails to remove a community from metadata with invalid id
 */
const removeCommunityFromMetadataFailsOnInvalidId = (
  state,
  metadata_id,
  community_id,
) => {
  it(
    "should fail when removing community '" +
      community_id +
      "' from metadata '" +
      metadata_id +
      "'",
    (done) => {
      request(app)
        .post("/api/v1/metadata/" + metadata_id + "/remove_community/")
        .set("Authorization", `Bearer ${state.token}`)
        .send({ id: community_id })
        .expect(422)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("error");
          res.body.should.have.property("errors");
          res.body.errors.should.be.an("array");
          // the error should be related to the deleted attribute
          expect(
            res.body.errors.some((e) => e.attribute === "community_Id"),
          ).to.equal(true);
          done();
        });
    },
  );
};

/**
 * Update a metadata successfully
 */
const updateMetadata = (state, metadata_id, updated_metadata) => {
  it("should sucessfully update metadata '" + metadata_id + "'", (done) => {
    request(app)
      .put("/api/v1/metadata/" + metadata_id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_metadata)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        expect(res.body.id).equal(metadata_id);
        //find metadata in list of metadata
        request(app)
          .get("/api/v1/metadata")
          .set("Authorization", `Bearer ${state.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            const foundMetadata = res.body.find((c) => c.id === metadata_id);
            for (const key in updated_metadata) {
              foundMetadata.should.have.property(key);
              if (typeof updated_metadata[key] === "object") {
                expect(foundMetadata[key].id).to.equal(
                  updated_metadata[key].id,
                );
              }
            }
            done();
          });
      });
  });
};

/**
 * Update a metadata successfully with a missing attribute
 */
const updateMetadataMissingAttribute = (
  state,
  metadata_id,
  updated_metadata,
  attr,
) => {
  it(
    "should sucessfully update metadata '" +
      metadata_id +
      "' without attr '" +
      attr +
      "'",
    (done) => {
      //create copy of metadata object and delete given attribute
      const updated_metadata_missing_attr = JSON.parse(
        JSON.stringify(updated_metadata),
      );
      delete updated_metadata_missing_attr[attr];
      request(app)
        .put("/api/v1/metadata/" + metadata_id)
        .set("Authorization", `Bearer ${state.token}`)
        .send(updated_metadata_missing_attr)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("message");
          res.body.should.have.property("id");
          expect(res.body.id).equal(metadata_id);
          //find metadata in list of metadata
          request(app)
            .get("/api/v1/metadata")
            .set("Authorization", `Bearer ${state.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const foundMetadata = res.body.find((c) => c.id === metadata_id);
              for (const key in updated_metadata_missing_attr) {
                if (key !== attr) {
                  foundMetadata.should.have.property(key);
                  if (typeof updated_metadata_missing_attr[key] === "object") {
                    expect(foundMetadata[key].id).to.equal(
                      updated_metadata_missing_attr[key].id,
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
 * Update a metadata successfully with single attribute
 */
const updateMetadataOnlyAttribute = (
  state,
  metadata_id,
  updated_metadata,
  attr,
) => {
  it(
    "should sucessfully update metadata '" +
      metadata_id +
      "' with attr '" +
      attr +
      "'",
    (done) => {
      //create copy of metadata object and delete all arrt except given attribute
      const updated_metadata_single_attr = JSON.parse(
        JSON.stringify(updated_metadata),
      );
      for (const key in updated_metadata_single_attr) {
        if (key !== attr) {
          delete updated_metadata_single_attr[key];
        }
      }
      request(app)
        .put("/api/v1/metadata/" + metadata_id)
        .set("Authorization", `Bearer ${state.token}`)
        .send(updated_metadata_single_attr)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          res.body.should.be.an("object");
          res.body.should.have.property("message");
          res.body.should.have.property("id");
          expect(res.body.id).equal(metadata_id);
          //find metadata in list of metadata
          request(app)
            .get("/api/v1/metadata")
            .set("Authorization", `Bearer ${state.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              const foundMetadata = res.body.find((c) => c.id === metadata_id);
              foundMetadata.should.have.property(attr);
              if (typeof updated_metadata_single_attr[attr] === "object") {
                expect(foundMetadata[attr].id).to.equal(
                  updated_metadata_single_attr[attr].id,
                );
              }
              done();
            });
        });
    },
  );
};

/**
 * Fails to update metadata with invalid owner
 */
const updateMetadataFailsOnInvalidOwner = (
  state,
  metadata_id,
  metadata,
  owner,
) => {
  it("should fail when owner '" + owner + "' is updated", (done) => {
    //create copy of metadata object and delete owner then add new owner
    const updated_metadata_owner = JSON.parse(JSON.stringify(metadata));
    updated_metadata_owner.owner.id = owner;
    request(app)
      .put("/api/v1/metadata/" + metadata_id)
      .set("Authorization", `Bearer ${state.token}`)
      .send(updated_metadata_owner)
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
 * Delete a Metadata successfully
 */
const deleteMetadata = (state, id) => {
  it("should successfully delete metadata ID " + id, (done) => {
    request(app)
      .delete("/api/v1/metadata/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.should.have.property("id");
        expect(res.body.id).to.equal(String(id));
        //ensure metadata is not found in list of metadata
        request(app)
          .get("/api/v1/metadata")
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
 * Fail to delete an invalid metadata
 */
const deleteMetadataFailsInvalidId = (state, id) => {
  it("should successfully delete metadata ID " + id, (done) => {
    request(app)
      .delete("/api/v1/metadata/" + id)
      .set("Authorization", `Bearer ${state.token}`)
      .expect(404)
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
};

/**
 * Test /api/v1/metadata route
 */
describe("/api/v1/metadata", () => {
  let state = {};

  beforeEach(async () => {
    state.token = await login("admin");
  });
  describe("GET /", () => {
    getAllMetadata(state);
    getMetadataSchemaMatch(state);

    const allowed_roles = [
      "view_documents",
      "manage_documents",
      "add_documents",
    ];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/metadata",
        "get",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("GET /{id}", () => {
    getSingleMetadata(state, 1);
    getSingleMetadata(state, 100);
    getSingleMetadataSchemaMatch(state, 1);
    getSingleMetadataSchemaMatch(state, 100);

    getSingleMetadataBadId(state, 0);
    getSingleMetadataBadId(state, -1);
    getSingleMetadataBadId(state, "test");
    getSingleMetadataBadId(state, 1000);

    const allowed_roles = [
      "view_documents",
      "manage_documents",
      "add_documents",
    ];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/metadata/1",
        "get",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("POST /", () => {
    createMetadata(state, new_metadata);

    createMetadataFailsOnMissingRequiredAttribute(state, new_metadata, "title");
    createMetadataFailsOnMissingRequiredAttribute(
      state,
      new_metadata,
      "author",
    );
    createMetadataFailsOnMissingRequiredAttribute(
      state,
      new_metadata,
      "publisher",
    );
    createMetadataFailsOnMissingRequiredAttribute(state, new_metadata, "date");
    createMetadataFailsOnMissingRequiredAttribute(
      state,
      new_metadata,
      "abstract",
    );
    createMetadataFailsOnMissingRequiredAttribute(
      state,
      new_metadata,
      "citation",
    );
    createMetadataFailsOnMissingRequiredAttribute(
      state,
      new_metadata,
      "copyright_id",
    );
    createMetadataFailsOnMissingRequiredAttribute(
      state,
      new_metadata,
      "keywords",
    );
    //createMetadataFailsOnMissingRequiredAttribute(state, new_metadata, "owner");

    // createMetadataFailsOnInvalidOwner(state, new_metadata, 0);
    // createMetadataFailsOnInvalidOwner(state, new_metadata, -1);
    // createMetadataFailsOnInvalidOwner(state, new_metadata, 100);
    // createMetadataFailsOnInvalidOwner(state, new_metadata, "owner");

    const allowed_roles = ["manage_documents", "add_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/metadata",
        "post",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("POST /{id}/add_document", () => {
    addDocumentToMetadata(state, 1, 1);

    addDocumentToMetadataFailsOnMissingDocumentId(state, 1);

    addDocumentToMetadataFailsOnInvalidId(state, 1, 0);
    addDocumentToMetadataFailsOnInvalidId(state, 1, -1);
    addDocumentToMetadataFailsOnInvalidId(state, 1, 1000);
    addDocumentToMetadataFailsOnInvalidId(state, 1, "test");

    const allowed_roles = ["manage_documents", "add_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/metadata/1/add_document",
        "post",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("POST /{id}/remove_document", () => {
    removeDocumentFromMetadata(state, 1, 1);

    removeDocumentFromMetadataFailsOnMissingDocumentId(state, 1);

    removeDocumentFromMetadataFailsOnInvalidId(state, 1, 0);
    removeDocumentFromMetadataFailsOnInvalidId(state, 1, -1);
    removeDocumentFromMetadataFailsOnInvalidId(state, 1, 1000);
    removeDocumentFromMetadataFailsOnInvalidId(state, 1, "test");

    const allowed_roles = ["manage_documents", "add_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/metadata/1/remove_document",
        "post",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("POST /{id}/add_community", () => {
    addCommunityToMetadata(state, 1, 1);
    addCommunityToMetadataFailsOnMissingCommunityId(state, 1);
    addCommunityToMetadataFailsOnInvalidId(state, 1, 0);
    addCommunityToMetadataFailsOnInvalidId(state, 1, -1);
    addCommunityToMetadataFailsOnInvalidId(state, 1, 1000);
    addCommunityToMetadataFailsOnInvalidId(state, 1, "test");

    const allowed_roles = ["manage_documents", "add_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/metadata/1/add_community",
        "post",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("POST /{id}/remove_community", () => {
    removeCommunityFromMetadata(state, 1, 1);
    removeCommunityFromMetadataFailsOnMissingCommunityId(state, 1);
    removeCommunityFromMetadataFailsOnInvalidId(state, 1, 0);
    removeCommunityFromMetadataFailsOnInvalidId(state, 1, -1);
    removeCommunityFromMetadataFailsOnInvalidId(state, 1, 1000);
    removeCommunityFromMetadataFailsOnInvalidId(state, 1, "test");

    const allowed_roles = ["manage_documents", "add_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/metadata/1/remove_community",
        "post",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("PUT /{id}", () => {
    updateMetadata(state, 1, new_metadata);
    updateMetadataMissingAttribute(state, 1, new_metadata, "title");
    updateMetadataMissingAttribute(state, 1, new_metadata, "author");
    updateMetadataMissingAttribute(state, 1, new_metadata, "publisher");
    updateMetadataMissingAttribute(state, 1, new_metadata, "date");
    updateMetadataMissingAttribute(state, 1, new_metadata, "abstract");
    updateMetadataMissingAttribute(state, 1, new_metadata, "citation");
    updateMetadataMissingAttribute(state, 1, new_metadata, "copyright_id");
    updateMetadataMissingAttribute(state, 1, new_metadata, "keywords");
    //updateMetadataMissingAttribute(state, 1, new_metadata, "owner");

    updateMetadataOnlyAttribute(state, 2, new_metadata, "title");
    updateMetadataOnlyAttribute(state, 2, new_metadata, "author");
    updateMetadataOnlyAttribute(state, 2, new_metadata, "publisher");
    updateMetadataOnlyAttribute(state, 2, new_metadata, "date");
    updateMetadataOnlyAttribute(state, 2, new_metadata, "abstract");
    updateMetadataOnlyAttribute(state, 2, new_metadata, "citation");
    updateMetadataOnlyAttribute(state, 2, new_metadata, "copyright_id");
    updateMetadataOnlyAttribute(state, 2, new_metadata, "keywords");
    //updateMetadataOnlyAttribute(state, 2, new_metadata, "owner");

    // updateMetadataFailsOnInvalidOwner(state, 3, new_metadata, 0);
    // updateMetadataFailsOnInvalidOwner(state, 3, new_metadata, -1);
    // updateMetadataFailsOnInvalidOwner(state, 3, new_metadata, 100);
    // updateMetadataFailsOnInvalidOwner(state, 3, new_metadata, "owner");

    const allowed_roles = ["manage_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/metadata/1",
        "put",
        r,
        allowed_roles.includes(r),
      );
    });
  });

  describe("DELETE /{id}", () => {
    deleteMetadata(state, 1);
    deleteMetadataFailsInvalidId(state, 0);
    deleteMetadataFailsInvalidId(state, -1);
    deleteMetadataFailsInvalidId(state, 1000);
    deleteMetadataFailsInvalidId(state, "test");

    const allowed_roles = ["manage_documents"];
    all_roles.forEach((r) => {
      testRoleBasedAuth(
        "/api/v1/metadata/1",
        "delete",
        r,
        allowed_roles.includes(r),
      );
    });
  });
});
