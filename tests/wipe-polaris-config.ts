import { FullConfig } from '@playwright/test';
import fs from 'node:fs';

async function globalSetup(config: FullConfig) {
    await fs.writeFile('automated.config.toml', '', () => { });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give server time to detect and apply config change
}

export default globalSetup;