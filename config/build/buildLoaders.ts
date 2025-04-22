import { ModuleOptions } from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { BuildOPtions } from './types/types'
import ReactRefreshTypeScript from 'react-refresh-typescript'

export function buildLoaders(options: BuildOPtions): ModuleOptions['rules'] {

    const isDev = options.mode === 'development'

    const cssLoaderWithModules = {
        loader: "css-loader",
        options: {
            modules: {
                localIdentName: "[local]_[hash:base64:8]",
                auto: true,
                mode: 'local'
            }
        },
    }

    const scssLoader = {
        test: /\.s[ac]ss$/i,
        use: [
            // Creates `style` nodes from JS strings
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            // Translates CSS into CommonJS
            cssLoaderWithModules,
            // Compiles Sass to CSS
            "sass-loader",
        ],
    }

    const tsLoader = {
        test: /\.tsx?$/,
        use: [
            {
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    getCustomTransformers: () => ({
                        before: [isDev && ReactRefreshTypeScript()].filter(Boolean),
                    })
                }
            }
        ]
    }

    const babelLoader = {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
            loader: "babel-loader",
            options: {
                presets: ['@babel/preset-env',
                    "@babel/preset-typescript",
                    ["@babel/preset-react", {
                        runtime: isDev ? 'automatic' : 'classic'
                    }]]
            }
        }
    }

    const assetLoader = {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
    }

    const svgrLoader = {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [
            {
                loader: '@svgr/webpack',
                options: {
                    icon: true,
                    svgoConfig: { //для упроавления цветом иконок
                        plugins: [
                            {
                                name: 'convertColors',
                                params: {
                                    currentColor: true
                                }
                            }
                        ]
                    }
                }
            }
        ],
    }

    const audioLoader = {
            test: /\.(mp3|wav)$/,
            type: 'asset/resource',
            generator: {
                filename: 'assets/[name][ext]',
            },
    }

    return [
        assetLoader,
        svgrLoader,
        scssLoader,
        tsLoader,
        audioLoader
        //babelLoader
    ]
}