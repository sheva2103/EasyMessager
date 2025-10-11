import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'
import { BuildOPtions } from './types/types'
import path from 'path'
import fs from 'fs'

export function buildDevServer(options: BuildOPtions): DevServerConfiguration {
    return {
        port: options.port ?? 3000,
        open: true,
        historyApiFallback: true, //для роутинка,
        hot: true,
        static: {
            directory: path.join(__dirname, 'build'),
        },
        https: {
            key: fs.readFileSync(path.resolve(__dirname, '..', '..','ssl', 'key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, '..', '..','ssl', 'cert.pem'))
        },

    }
}