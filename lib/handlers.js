/**
 * Handlers module
 */


// Dependencies
// const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');
const fs = require('fs');
const http = require('http');
const request = require('request');
const FormData = require('form-data');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// Handlers container
const handlers = {};
const _data = require('./data');

handlers.fan = (data,callback)=>{
	let acceptableMethods = ['post','get','put','delete'];
	if(acceptableMethods.indexOf(data.method)>-1){
		handlers._fan[data.method](data,callback);
	}else{
		callback(405);
	}
};

handlers._fan={};

handlers._fan.post = (d,callback)=>{
	let payload = d.payload;
	console.log(payload.adresa_liv_2);
	let csvWriter = createCsvWriter({
		path: __dirname+'/out.csv',
		header: [
			{id: 'tip_serviciu', title: 'Tip Serviciu'},
			{id: 'banca', title: 'Banca'},
			{id: 'iban', title: 'IBAN'},
			{id: 'nr_plicuri', title: 'Nr. Plicuri'},
			{id: 'nr_colete', title: 'Nr. Colete'},
			{id: 'greutate', title: 'Greutate'},
			{id: 'plata_expeditie', title: 'Plata Expeditie'},
			{id: 'ramburs', title: 'Plata Expeditie'},
			{id: 'plata_ramburs', title: 'Plata ramburs la'},
			{id: 'valoare_declarata', title: 'Valoare declarata'},
			{id: 'contact_exp', title: 'Persoana contact expeditor'},
			{id: 'observatii', title: 'Observatii'},
			{id: 'continut', title: 'Continut'},
			{id: 'nume_destinatar', title: 'Nume destinatar'},
			{id: 'persoana_contact', title: 'Persoana Contact'},
			{id: 'telefon', title: 'Telefon'},
			{id: 'fax', title: 'Fax'},
			{id: 'email', title: 'Email'},
			{id: 'judet', title: 'Judet'},
			{id: 'localitate', title: 'Localitate'},
			{id: 'strada', title: 'Strada destinatar'},
			{id: 'nr', title: 'Nr'},
			{id: 'cod_postal', title: 'Cod Postal'},
			{id: 'bloc', title: 'Bloc'},
			{id: 'scara', title: 'Scara'},
			{id: 'etaj', title: 'Etaj'},
			{id: 'apartament', title: 'Apartament'},
			{id: 'inaltime_pachet', title: 'Inaltime pachet'},
			{id: 'latime_pachet', title: 'Latime pachet'},
			{id: 'lungime_pachet', title: 'Lungime pachet'},
			{id: 'restituire', title: 'Restituire'},
			{id: 'centru_cost', title: 'Centru Cost'},
			{id: 'optiuni', title: 'Optiuni'},
			{id: 'packing', title: 'Packing'},
			{id: 'date_personale', title: 'Date personale'},
		]
	});
	const data = [
		{
			tip_serviciu: payload.tip_serv_2,
			banca: '',
			iban: '',
			nr_plicuri: payload.nr_p_2,
			nr_colete: payload.nr_c_2,
			greutate: payload.greutate_2,
			plata_expeditie: payload.plata_exp_2,
			ramburs: payload.ramburs_2,
			plata_ramburs: 'Expeditor',
			valoare_declarata: '',
			contact_exp: '',
			observatii: payload.observatii_2,
			continut: payload.continut_2,
			nume_destinatar: payload.destinatar_2,
			persoana_contact: payload.contact_2,
			telefon: payload.phone_2,
			fax: '',
			email: '',
			judet: payload.judet_2,
			localitate: payload.localitate_2,
			strada: payload.adresa_liv_2,
			nr: payload.nr_2,
			cod_postal: payload.cod_postal_2,
			bloc: payload.bloc_2,
			scara: payload.scara_2,
			etaj: payload.etaj_2,
			apartament: payload.apartament_2,
			inaltime_pachet: '',
			latime_pachet: '',
			lungime_pachet: '',
			restituire: '',
			centru_cost: '',
			optiuni: '',
			packing: '',
			date_personale: ''
		}
	];
	csvWriter
		.writeRecords(data)
		.then(()=> {
			const formData = {
				username:'',user_pass:'',client_id:'', fisier:fs.createReadStream(__dirname+'/out.csv')
			};
			request.post({url:'https://www.selfawb.ro/import_awb_integrat.php/', formData: formData}, function optionalCallback(err, httpResponse, body) {
				if (err) {
					return console.error('upload failed:', err);
				}
				_data.create('awb', payload.oid, body, (err)=>{
					if(!err){
						callback(200,{'awb':body.split(',')[2]});
					}else{
						console.log(err);
						callback(500,{'Error':'File allready exists'})
					}
				});
			});
		});

};
handlers.fanGetAwb = (data,callback)=>{
	let orderName = JSON.stringify(data.payload.order_id).split('"')[1];
	console.log(orderName);
	// console.log(orderName)
	_data.read('awb',orderName,(err,data)=>{
		if(!err && data){
			console.log(data);
			callback(200,{'awb':data.split(',')[2]});
		}else{
			callback(100);
		}
	})
};

handlers.smartBill=(data,callback)=>{
	let acceptableMethods = ['post','get','put','delete'];
	if(acceptableMethods.indexOf(data.method)>-1){
		handlers._smartBill[data.method](data,callback);
	}else{
		callback(405);
	}
};

handlers._smartBill={};
handlers._smartBill.post = (data,callback)=>{
	let stringPayload = JSON.stringify(data.payload.data);
	let orderName = JSON.stringify(data.payload.oid).split('"')[1];
	console.log(orderName);
	let req= require('request').post({
		uri:"http://ws.smartbill.ro/SBORO/api/invoice",
		body:stringPayload,
		headers:{'username':'', "password":'', "Accept":'application/json', 'Content-Type':"application/json"},
	},function(err,res,body){
		let parsedBody = JSON.parse(body);
		if(parsedBody.errorText!==''){
			callback(400,{"error":parsedBody.errorText})
		}else{
			_data.create('invoices', orderName, body, (err)=>{
				if(!err){
					callback(200,{'data':parsedBody.series+parsedBody.number});
				}else{
					console.log(err);
					callback(500,{'Error':'File allready exists'})
				}
			});
		}


	});
	// WriteFile

};
handlers.smartBillGet = (data,callback)=>{

	let orderName = JSON.stringify(data.payload.order_id).split('"')[1];;
	console.log(orderName);
	// console.log(orderName)
	_data.read('invoices',orderName,(err,data)=>{
		if(!err && data){
			let parsedData = JSON.parse(data);
			console.log(parsedData.errorText);
			if(parsedData.errorText!==""){
				callback(400,{'error':parsedData.errorText});
			}else{
				callback(200,{'data':parsedData.series+parsedData.number});
			}
		}else{
			callback(100);
		}
	})
};

handlers.ping=(data,callback)=>{
	console.log('pinged');
	callback(200)
};

// Export module
module.exports = handlers;
