const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log('Connecting to database...');
    const conn = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3307,
        user: 'root',
        password: '',
        database: 'hrm-saas-kiaan-codestore'
    });

    console.log('Generating password hashes...');
    const hash = await bcrypt.hash('admin123', 10);

    console.log('Seeding demo company...');
    await conn.execute(`
        INSERT INTO companies (id, company_name, owner_name, email, phone, address, plan, employee_limit, status, subscription_start, subscription_end, created_by)
        VALUES (1, 'Demo Enterprise Ltd', 'Alex Johnson', 'admin@example.com', '+1 555-0199', '123 Innovation Way, Tech District', 'Enterprise Elite', 100, 'active', '2026-01-01', '2027-01-01', 1)
        ON DUPLICATE KEY UPDATE company_name = 'Demo Enterprise Ltd'
    `);

    console.log('Seeding demo employees...');
    await conn.execute(`
        INSERT INTO employees (id, machine_id, name, role, department, email, salary_rate, salary_type, status, joined_date, custom_id, shift, phone, created_by, company_id)
        VALUES 
        (1, 'EMP001', 'Alex Johnson', 'admin', 'Management', 'admin@example.com', 8500.00, 'monthly', 'active', '2025-01-01', 'EMP001', 'General', '+1 555-0199', 1, 1),
        (2, 'EMP002', 'John Doe', 'employee', 'Engineering', 'employee@example.com', 4500.00, 'monthly', 'active', '2025-02-01', 'EMP002', 'General', '+1 555-0188', 1, 1)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    console.log('Seeding demo users...');
    await conn.execute(`
        INSERT INTO users (id, employee_id, email, password, role, name, company_id)
        VALUES 
        (1, NULL, 'superadmin@example.com', ?, 'superadmin', 'System SuperAdmin', NULL),
        (2, 1, 'admin@example.com', ?, 'admin', 'Demo Company Admin', 1),
        (3, 2, 'employee@example.com', ?, 'employee', 'John Doe', 1)
        ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, [hash, hash, hash]);

    console.log('Seeding demo subscription plans...');
    await conn.execute(`
        INSERT INTO plans (id, name, price, duration, description, features, buttonText, isPopular, employee_limit)
        VALUES 
        (1, 'Starter', 29.00, 'monthly', 'Essential HR tools for small startups and small teams.', '["Up to 25 Employees", "Biometric Attendance Sync", "Basic Leave Management", "Standard Email Alerts", "Self-Service Portal"]', 'Get Started', 0, 25),
        (2, 'Professional', 79.00, 'monthly', 'Complete automation for growing businesses with multiple departments.', '["Up to 100 Employees", "Biometric and Mobile Check-in", "Advanced Leave and Shifts", "Automated Payroll and Slips", "WhatsApp Notifications", "Priority Email Support"]', 'Upgrade to Pro', 1, 100),
        (3, 'Enterprise Elite', 199.00, 'monthly', 'Full-spectrum HR, biometric hardware integration, and multi-branch support.', '["Unlimited Employees", "Multi-Device Biometric Sync", "Custom Payroll Rules and Tax", "AI HR Assistant Copilot", "Full WhatsApp and Email Queue", "Dedicated Account Manager", "Custom Domain and White-label"]', 'Contact Sales', 0, 9999)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    console.log('Seeding demo subscriptions...');
    await conn.execute(`
        INSERT INTO subscriptions (id, company_id, plan_name, amount, billing_cycle, payment_status, order_id, payment_id, start_date, end_date)
        VALUES (1, 1, 'Enterprise Elite', 199.00, 'monthly', 'paid', 'ORD_INIT_001', 'PAY_INIT_001', '2026-01-01', '2027-01-01')
        ON DUPLICATE KEY UPDATE plan_name = 'Enterprise Elite'
    `);

    console.log('Seeding demo settings...');
    await conn.execute(`
        INSERT INTO settings (id, machine_ip, machine_port, machine_alias, sync_interval, late_deduction, late_deduction_amount, salary_cycle, ot_multiplier, business_name, business_address, business_phone, business_email, standard_start_time, company_id, timezone, currency, date_format, language, grace_period_mins, standard_end_time, weekends, salary_cycle_start_date, notify_leaves, notify_claims, notify_password_resets, contribution_enabled, country)
        VALUES (1, '192.168.1.201', 4370, 'ZKTeco Main', 30, 1, 50.00, 'Monthly (1st to 30th)', 1.50, 'Demo Enterprise Ltd', '123 Innovation Way, Tech District', '+1 555-0199', 'admin@example.com', '09:00:00', 1, 'UTC', 'USD', 'DD/MM/YYYY', 'English', 15, '18:00:00', 'Sunday,Saturday', 1, 1, 1, 1, 1, 'United States')
        ON DUPLICATE KEY UPDATE business_name = 'Demo Enterprise Ltd'
    `);

    console.log('Seeding demo global_settings...');
    await conn.execute(`
        INSERT INTO global_settings (id, platform_name, support_email, timezone, currency, date_format, language, company_name, company_logo, company_address, contact_number, about_us, copyright_text, powered_by, country)
        VALUES (1, 'BioTrack Pro', 'support@example.com', 'UTC', 'USD', 'DD/MM/YYYY', 'English', 'BioTrack Pro', '/logo.png', '123 Business Avenue, Tech Park', '+1 555-0199', 'BioTrack Pro is a modern multi-tenant HR & attendance management system delivering innovative, secure, and scalable workforce solutions.', '© 2026 BioTrack Pro. All rights reserved.', 'BioTrack Pro', 'United States')
        ON DUPLICATE KEY UPDATE platform_name = 'BioTrack Pro'
    `);

    const [users] = await conn.execute('SELECT id, email, role, name FROM users');
    console.log('Successfully seeded demo users:', users);

    await conn.end();
    console.log('Seed completed successfully!');
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
