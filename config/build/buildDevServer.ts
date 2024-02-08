import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'
import { BuildOPtions } from './types/types'

export function buildDevServer(options: BuildOPtions): DevServerConfiguration {
    return {
        port: options.port ?? 3000,
        open: true,
        historyApiFallback: true, //для роутинка,
        hot: true
    }
}