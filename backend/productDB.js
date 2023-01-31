import mariadb from 'mariadb';

class productDB {
	constructor() {
		this.SQL = null;
		this.config = { 
			user: "student",
			password: "student",
			host: "blitz.cs.niu.edu",
			port: 3306,
			database: "csci467"
		};
	}

	async connect() {
		this.SQL = await mariadb.createConnection(this.config); 
		console.log('Connection made to MariaDB...');
	}


	async getProduct(id) {
		return (await this.query(`SELECT * FROM parts WHERE number=${id}`))[0];
	}

	async getProducts() {
		return await this.query(`SELECT * FROM parts ORDER BY number ASC`);
	}

	async query(req) {
		var query;
		try {
			query = await this.SQL.query(req);
		}
		catch(e) { return e; }

		return query;
	}
}

export default productDB;