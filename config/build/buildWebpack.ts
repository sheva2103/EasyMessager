import webpack from 'webpack'

import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

import { buildDevServer } from './buildDevServer'
import { buildLoaders } from './buildLoaders'
import { buildPlagins } from './buildPlagins'
import { buildResolvers } from './buildResolvers'
import { BuildOPtions } from './types/types'

export function buildWebpack(options: BuildOPtions): webpack.Configuration {

    const {mode, paths} = options
    const isDev = mode === 'development'

    return {
        mode: mode ?? 'development',
        entry: paths.entry,
        output: {
            path: paths.output,
            filename: '[name].[contenthash].js',
            clean: true
        },
        plugins: buildPlagins(options),
        module: {
            rules: buildLoaders(options),
        },
        resolve: buildResolvers(options),
        devtool: isDev ? 'inline-source-map' : 'source-map',
        devServer: isDev ? buildDevServer(options) : undefined
    }
}