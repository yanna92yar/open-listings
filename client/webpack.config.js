import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import Dotenv from 'dotenv-webpack';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config()
const paths = {
    public: path.resolve(__dirname, '..', 'public', 'javascripts'),
    cssImages: path.resolve(__dirname, '..', 'public', 'stylesheets', 'images'),
}

const isDevEnv = ['development', 'localhost'].includes(process.env.NODE_ENV)
const devConfig = {
    mode: 'development',
    devtool: 'source-map'
}

export default {
    entry: {
        index: './src/views/main/index.js',
        listing: './src/views/listings/listing.js',
        biglists: './src/views/biglistings/biglists.js',
        skills: './src/views/skills/skills.js',
        tags: './src/views/tags/tags.js',
        easteregg: './src/views/easteregg/easteregg.js',
    },
    output: {
        filename: '[name]/[name].js',
        path: paths.public,
    },
    ...(isDevEnv && devConfig),
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [],
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                type: "asset/resource",
                generator: {
                    filename: "../stylesheets/[name].css",
                },
                use: ["sass-loader"],
            },
        ]
    },
    plugins: [new Dotenv()],
    node: {
        __dirname: true,
    }
}
