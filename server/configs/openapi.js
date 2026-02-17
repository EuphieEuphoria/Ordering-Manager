import swaggerJSDoc from "swagger-jsdoc";

function url() {
  if (process.env.OPENAPI_HOST) {
    return process.env.OPENAPI_HOST;
  } else {
    const port = process.env.PORT || "3000";
    return `http://localhost:${port}`;
  }
}

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Example Project",
      version: "0.0.1",
      description: "Example Project",
    },
    servers: [
      {
        url: url(),
      },
    ],
  },
  apis: [
    "./routes/*.js",
    "./models/*.js",
    "./routes/api/v1/*.js",
    "./utilities/*.js",
  ],
};

export default swaggerJSDoc(options);
