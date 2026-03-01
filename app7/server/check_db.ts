import Database from 'better-sqlite3';

const db = new Database('survey.db');

try {
    const row = db.prepare("SELECT * FROM sites WHERE request_id IS NOT NULL AND request_id != '' LIMIT 1").get() as any;
    console.log('Sample Row:', JSON.stringify(row, null, 2));

    const total = db.prepare('SELECT COUNT(*) as count FROM sites').get() as any;
    console.log('Total Sites:', total.count);

    const surveyedWithNoCost = db.prepare('SELECT COUNT(*) as count FROM sites WHERE is_surveyed = 1 AND (survey_cost = 0 OR survey_cost IS NULL)').get() as any;
    console.log('Surveyed with no cost:', surveyedWithNoCost.count);

    const emptyFields = db.prepare("SELECT COUNT(*) as count FROM sites WHERE request_id = '' OR request_id IS NULL").get() as any;
    console.log('Sites with empty request_id:', emptyFields.count);

} catch (e) {
    console.error(e);
}
db.close();
