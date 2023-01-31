import bcrypt from 'bcryptjs';
const data = {
  users: [
    {
      name: 'Abe',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
	  role: 'admin'
    },
    {
      name: 'Flabe',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
	  role: 'customer'
    },
	
    {
		name: 'Grabe',
		email: 'employee@example.com',
		password: bcrypt.hashSync('123456'),
		role: 'employee'
	  },
  ],
  SHCharge: [
    {
      maxWeight: '5',
      shipCharge: '3',
      taxCharge: '3'
    },
    {
      maxWeight: '10',
      shipCharge: '4',
      taxCharge: '4'
    },
    {
      maxWeight: '15',
      shipCharge: '6',
      taxCharge: '6'
    }
  ]
};
export default data;
