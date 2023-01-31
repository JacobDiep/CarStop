import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Store } from '../Store';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function SHChargesScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [data, setData] = useState([]);

  useEffect(() => {
	(async () => {
		const res = await axios.get(`/api/SHCharges/sh`, {
			headers: { authorization: `Bearer ${userInfo.token}` },
		});
		setData(res.data);
	})();
  }, [userInfo]);

  const handleTaxChange = (async (elem) => {
	let newVal = elem.value;
    let id = elem.className;

    await axios.post(`/api/SHCharges/${id}/tax`, {val: newVal}, {
		headers: { authorization: `Bearer ${userInfo.token}` }, 
  	});
  });

  const handleShipChange = (async (elem) => {
	let newVal = elem.value;
    let id = elem.className;

    await axios.post(`/api/SHCharges/${id}/ship`, {val: newVal}, {
		headers: { authorization: `Bearer ${userInfo.token}` },
	});
  });

  
  return (
    <div>
    <Row>
      <Col>
        <h1>Shipping and Handling Charges</h1>
      </Col>
    </Row>
    <table className="table" style={{ fontSize: '1.2em' }}>
          <thead>
            <tr>
              <th>WEIGHT BRACKET (LB)</th>
              <th>TAX CHARGE (%)</th>
              <th>SHIPPING CHARGE (%)</th>
            </tr>
          </thead>
          <tbody>
			{data && data.map(item => (
				<tr key={item._id}><td>{item.maxWeight}</td>
					<td>
						<input id="sh" type="number" className={item._id} onInput={(e) => { handleTaxChange(e.target) }} defaultValue={item.taxCharge} min='0' max='100'></input>
					</td>
					<td>
						<input id="sh" type="number" className={item._id} onInput={(e) => { handleShipChange(e.target) }} defaultValue={item.shipCharge} min='0' max='100'></input>
					</td>
				</tr>
			))}
          </tbody>
        </table>
  </div>
  );
}
