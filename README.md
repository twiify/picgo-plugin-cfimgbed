# PicGo Plugin for CF-Imgbed

[![npm version](https://img.shields.io/npm/v/picgo-plugin-cfimgbed.svg)](https://www.npmjs.com/package/picgo-plugin-cfimgbed)

A [PicGo](https://github.com/Molunerfinn/PicGo) plugin for uploading images to a [CF-Imgbed](https://github.com/nsnail/cf-imgbed) (or compatible) instance.

## Features

- Upload images to your self-hosted or public CF-Imgbed service.
- Supports custom API endpoint.
- Supports API Key authentication.
- Supports specifying an upload directory.

## Installation

1.  Open PicGo application.
2.  Go to `Plugin Settings`.
3.  Search for `cfimgbed` and click `Install`.
4.  Restart PicGo (if prompted or if the uploader doesn't appear).

Alternatively, you can install via PicGo CLI:

```bash
picgo install cfimgbed
```

## Configuration

After installation, configure the plugin in PicGo:

1.  Go to `Plugin Settings` and find `cfimgbed`. Click the gear icon or right-click to configure.
    Alternatively, go to `PicGo Settings` -> `Set Uploader` -> `CF-Imgbed`.
2.  Fill in the following fields:

    - **API Endpoint**: The base URL of your CF-Imgbed instance (e.g., `https://your-imgbed-domain.com`). This should be the root URL, and the plugin will append `/api/upload`.
    - **API Key**: Your full API key for CF-Imgbed.
    - **Upload Directory** (Optional): Specify a default directory on the server where images will be uploaded (e.g., `mypics/travel`). If left empty, images will be uploaded to the server's default location.

## Usage

1.  In PicGo, select `CF-Imgbed` as your active uploader from the uploader selection menu.
2.  Upload images as you normally would with PicGo (drag & drop, clipboard, etc.).
3.  The uploaded image URL will be automatically copied to your clipboard.

## CF-Imgbed API

This plugin uses the `/api/upload` endpoint of the CF-Imgbed API. It sends a `POST` request with a JSON payload containing base64 encoded image data.

**Request Body Example:**

```json
{
  "list": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."],
  "uploadDirectory": "optional/path"
}
```

**Headers:**

- `X-API-Key: your_full_api_key`
- `Content-Type: application/json`

For more details on the CF-Imgbed API, please refer to its [documentation](https://github.com/twiify/CF-ImgBed) (assuming this is the correct project, please update if not).

## License

[MIT](LICENSE)
