const got = require("got");

const PLUGIN_NAME = "cfimgbed";

module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register(PLUGIN_NAME, {
      handle,
      name: "CF-Imgbed",
      config: config,
    });
  };

  return {
    uploader: PLUGIN_NAME,
    register,
  };
};

const handle = async (ctx) => {
  const userConfig = ctx.getConfig(`picBed.${PLUGIN_NAME}`);
  if (!userConfig) {
    throw new Error("Can't find CF-Imgbed uploader_config");
  }

  const apiKey = userConfig.apiKey;
  const apiEndpoint = userConfig.apiEndpoint;
  const uploadDirectory = userConfig.uploadDirectory || "";

  if (!apiKey || !apiEndpoint) {
    ctx.emit("notification", {
      title: "CF-Imgbed 配置错误",
      body: "请检查 API Key 和 API Endpoint 是否已配置",
    });
    throw new Error("API Key or API Endpoint is missing");
  }

  const imgList = ctx.output;
  const results = [];

  for (const img of imgList) {
    try {
      const base64Image =
        img.base64Image || Buffer.from(img.buffer).toString("base64");
      const dataUrl = `data:${
        img.mimeType || ctx.input[imgList.indexOf(img)].mimeType || "image/png"
      };base64,${base64Image}`;

      const body = {
        list: [dataUrl],
      };
      if (uploadDirectory) {
        body.uploadDirectory = uploadDirectory;
      }

      const { body: resBody, statusCode } = await got.post(
        `${apiEndpoint.replace(/\/$/, "")}/api/upload`,
        {
          headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json",
          },
          json: body,
          responseType: "json",
        }
      );

      if (
        statusCode === 200 &&
        resBody.success &&
        resBody.data &&
        resBody.data.length > 0
      ) {
        const uploadedImage = resBody.data[0];
        img.imgUrl = uploadedImage.url;
        img.url = uploadedImage.url;

        img.id = uploadedImage.id;
        img.r2Key = uploadedImage.r2Key;
        results.push(img);
        ctx.log.info(`[CF-Imgbed] Uploaded ${img.fileName} to ${img.imgUrl}`);
      } else if (
        statusCode === 200 &&
        !resBody.success &&
        resBody.results &&
        resBody.results.length > 0
      ) {
        const result = resBody.results[0];
        const errorMsg = `[CF-Imgbed] Failed to upload ${img.fileName}: ${
          result.message || "Unknown error from API"
        }`;
        ctx.log.error(errorMsg);
        ctx.emit("notification", {
          title: "CF-Imgbed 上传失败",
          body: `${img.fileName}: ${result.message || "Unknown error"}`,
        });
        // Even if one fails, we continue with others, PicGo handles partial success
      } else {
        const errorMsg = `[CF-Imgbed] Failed to upload ${
          img.fileName
        }. Status: ${statusCode}, Body: ${JSON.stringify(resBody)}`;
        ctx.log.error(errorMsg);
        ctx.emit("notification", {
          title: "CF-Imgbed 上传失败",
          body: `${img.fileName}: HTTP ${statusCode} - ${
            resBody.message || "Unknown error"
          }`,
        });
      }
    } catch (error) {
      ctx.log.error(
        `[CF-Imgbed] Error uploading ${img.fileName}: ${error.message}`
      );
      ctx.emit("notification", {
        title: "CF-Imgbed 上传错误",
        body: `${img.fileName}: ${error.message}`,
      });
    }
  }
  // PicGo expects ctx.output to be the array of successfully uploaded images
  // If some failed, they won't have imgUrl and PicGo might handle them as failures.
  // We only return successfully processed items in ctx.output
  ctx.output = imgList.filter((item) => item.imgUrl);
  return ctx;
};

const config = (ctx) => {
  let userConfig = ctx.getConfig(`picBed.${PLUGIN_NAME}`);
  if (!userConfig) {
    userConfig = {};
  }
  const prompts = [
    {
      name: "apiEndpoint",
      type: "input",
      message: "部署的 CF-ImgBed 访问地址 (e.g., https://your-cf-imgbed.com)",
      default: userConfig.apiEndpoint || "",
      required: true,
      validate: (input) => {
        if (!input) return "API Endpoint cannot be empty.";
        if (!/^https?:\/\/.+/.test(input))
          return "Please enter a valid URL (e.g., http://localhost or https://example.com).";
        return true;
      },
    },
    {
      name: "apiKey",
      type: "password",
      message: "API Key (你的API Key)",
      default: userConfig.apiKey || "",
      required: true,
      validate: (input) => {
        if (!input) return "API Key 不能为空";
        return true;
      },
    },
    {
      name: "uploadDirectory",
      type: "input",
      message: "上传目录 (可选, e.g., wallpapers/nature)",
      default: userConfig.uploadDirectory || "",
      required: false,
    },
  ];
  return prompts;
};
