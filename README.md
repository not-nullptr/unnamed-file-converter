![VERT](static/banner.png)

VERT is a file conversion utility that uses WebAssembly to convert files on your device instead of a cloud. Check out the live instance at [vert.sh](https://vert.sh).

VERT is built in Svelte and TypeScript.

## Features

- Convert files directly on your device using WebAssembly
- No file size limits
- Supports multiple file formats
- User-friendly interface built with Svelte

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [pnpm](https://pnpm.io/) (version 6 or higher)

### Installation
```sh
# Clone the repository
git clone https://github.com/yourusername/vert.git
cd vert
# Install dependencies
pnpm install
```

### Running Locally

To run the project locally, run `pnpm run dev`.

This will start a development server. Open your browser and navigate to `http://localhost:5173` to see the application.

### Building for Production

Before building for production, make sure you create a `.env` file in the root of the project with the following content:

```sh
PUB_HOSTNAME=vert.sh # change to your domain
PUB_PLAUSIBLE_URL=https://plausible.example.com # can be empty if not using Plausible
```

To build the project for production, run `pnpm run build`

This will build the site to the `build` folder. You can then start the server with `bun ./build/index.js` and navigate to `http://localhost:3000` to see the application.

## License

This project is licensed under the AGPL-3.0 License, please see the [LICENSE](LICENSE) file for details.
