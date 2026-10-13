const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
    console.log('🚀 Starting Codester Submission Asset Generation...');

    const hrmDir = path.resolve(__dirname, '..');
    const rootDir = path.resolve(hrmDir, '..');
    const outputDir = path.join(rootDir, 'Codester-Ready-Upload');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. Generate 590x300 Preview Thumbnail using Puppeteer
    console.log('🖼️ 1. Generating 590x300 Preview Thumbnail...');
    const iconPath = path.join(hrmDir, 'icon-200x200.png');
    const iconBase64 = fs.existsSync(iconPath) ? fs.readFileSync(iconPath).toString('base64') : '';

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 590, height: 300, deviceScaleFactor: 2 });

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { width: 590px; height: 300px; background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%); display: flex; align-items: center; justify-content: space-between; padding: 26px 34px; overflow: hidden; position: relative; }
        .bg-glow { position: absolute; width: 380px; height: 380px; background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%); top: -120px; right: -60px; filter: blur(40px); }
        .left { z-index: 2; max-width: 330px; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.4); border-radius: 999px; color: #818cf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
        h1 { font-size: 27px; font-weight: 900; color: #ffffff; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 6px; }
        h1 span { background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        p { font-size: 11.5px; color: #94a3b8; line-height: 1.45; margin-bottom: 14px; font-weight: 500; }
        .tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag { font-size: 9px; font-weight: 700; color: #cbd5e1; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); text-transform: uppercase; letter-spacing: 0.04em; }
        .right { z-index: 2; display: flex; flex-direction: column; align-items: center; }
        .logo-card { width: 140px; height: 140px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.25); }
        .logo-card img { width: 110px; height: 110px; object-fit: contain; }
        .version { margin-top: 10px; font-size: 10.5px; font-weight: 800; color: #38bdf8; letter-spacing: 0.08em; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="bg-glow"></div>
    <div class="left">
        <div class="badge">★ Commercial SaaS v1.0</div>
        <h1>BioTrack <span>Pro</span></h1>
        <p>Multi-Tenant HRM, AI Face Attendance, Geofencing & Automated Payroll System</p>
        <div class="tags">
            <span class="tag">React 19 + Vite</span>
            <span class="tag">Node.js Express</span>
            <span class="tag">MySQL 43 Tables</span>
            <span class="tag">Gemini AI Copilot</span>
        </div>
    </div>
    <div class="right">
        <div class="logo-card">
            <img src="data:image/png;base64,${iconBase64}" />
        </div>
        <div class="version">Codester Verified</div>
    </div>
</body>
</html>`;

    await page.setContent(htmlContent);
    const preview590Path = path.join(outputDir, 'preview-590x300.png');
    await page.screenshot({ path: preview590Path, type: 'png' });
    // Also save in HRM-SaaS
    fs.copyFileSync(preview590Path, path.join(hrmDir, 'preview-590x300.png'));
    await browser.close();
    console.log('✅ Generated:', preview590Path);

    // 2. Copy 200x200 Icon to outputDir
    console.log('🖼️ 2. Copying 200x200 Icon...');
    const destIcon = path.join(outputDir, 'icon-200x200.png');
    fs.copyFileSync(iconPath, destIcon);
    console.log('✅ Copied:', destIcon);

    // 3. Create Clean Staging Folder for Main ZIP
    console.log('📦 3. Staging clean project files (EXCLUDING node_modules)...');
    const stageDir = path.join(outputDir, 'BioTrack-Pro-v1.0.0');
    if (fs.existsSync(stageDir)) {
        fs.rmSync(stageDir, { recursive: true, force: true });
    }
    fs.mkdirSync(stageDir, { recursive: true });

    // Documentation files to include
    const docs = [
        'README.md',
        'INSTALLATION.md',
        'CONFIGURATION.md',
        'LICENSE-GUIDE.md',
        'USER-GUIDE.md',
        'ADMIN-GUIDE.md',
        'TROUBLESHOOTING.md',
        'CHANGELOG.md',
        'THIRD_PARTY_LICENSES.md',
        'DOCUMENTATION.md',
        'hrm-saas-kiaan-codestore.sql',
        '.gitignore'
    ];

    docs.forEach(doc => {
        const src = path.join(hrmDir, doc);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(stageDir, doc));
        }
    });

    // Copy Backend using robocopy excluding node_modules
    console.log('📦 Copying backend-hrm (skipping node_modules, uploads)...');
    const backendStage = path.join(stageDir, 'backedn-hrm');
    try {
        execSync(`robocopy "${path.join(hrmDir, 'backedn-hrm')}" "${backendStage}" /E /XD node_modules uploads sessions backups /XF *.log`, { stdio: 'ignore' });
    } catch (e) {
        // robocopy returns non-zero on success (exit code 1 = files copied)
    }
    // Ensure uploads folder exists but empty
    fs.mkdirSync(path.join(backendStage, 'uploads'), { recursive: true });

    // Copy Frontend using robocopy excluding node_modules
    console.log('📦 Copying frontend-hrm (skipping node_modules)...');
    const frontendStage = path.join(stageDir, 'frontend-hrm');
    try {
        execSync(`robocopy "${path.join(hrmDir, 'frontend-hrm')}" "${frontendStage}" /E /XD node_modules`, { stdio: 'ignore' });
    } catch (e) {
        // robocopy exit codes
    }

    // 4. Zip the staged clean directory into BioTrack-Pro-v1.0.0.zip
    console.log('🗜️ 4. Compressing main product archive into BioTrack-Pro-v1.0.0.zip...');
    const zipPath = path.join(outputDir, 'BioTrack-Pro-v1.0.0.zip');
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

    // Use PowerShell Compress-Archive
    execSync(`powershell -Command "Compress-Archive -Path '${stageDir}\\*' -DestinationPath '${zipPath}' -CompressionLevel Optimal"`, { stdio: 'inherit' });
    console.log('✅ Main Zip Created:', zipPath);

    // Remove stageDir after zipping
    fs.rmSync(stageDir, { recursive: true, force: true });

    // 5. Create screenshots.zip
    console.log('📸 5. Creating screenshots.zip...');
    const screenshotsZip = path.join(outputDir, 'screenshots.zip');
    if (fs.existsSync(screenshotsZip)) fs.unlinkSync(screenshotsZip);
    const screenshotsDir = path.join(hrmDir, 'screenshots');
    execSync(`powershell -Command "Compress-Archive -Path '${screenshotsDir}\\*.png', '${hrmDir}\\landing-page.png', '${hrmDir}\\geofencing-dashboard.png' -DestinationPath '${screenshotsZip}' -CompressionLevel Optimal"`, { stdio: 'inherit' });
    console.log('✅ Screenshots Zip Created:', screenshotsZip);

    console.log('🎉 ALL CODESTER ASSETS SUCCESSFULLY GENERATED!');
}

main().catch(err => {
    console.error('❌ Error during asset build:', err);
    process.exit(1);
});
