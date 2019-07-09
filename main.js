
const {google} = require('googleapis');
const credentials = require('./credentials.json');
const file1 = require('./Metrics/File1');
const file2 = require('./Metrics/File2');

var tps=[];

file1().then((response)=> { 
    tps.push(response)

    file2().then((response1)=> {
        tps.push(response1)
        updateSheet(tps);
    })
})

function updateSheet(tpsreport) {
    const client = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    client.authorize(function(err, tokens) {
        if(err) {
            console.log(err);
            return;
        } else {
            console.log('Connected');
            gsrun(client)
        }
    })
    
    async function gsrun(cl) {
        
        const gsapi = google.sheets({version: 'v4', auth: cl});
    
        const opt = {
            spreadsheetId: 'YOUR_SPREADSHEET_ID',    //Spreadsheet to read from
            range: 'Sheet1!A1:A'
        };
        let data = await gsapi.spreadsheets.values.get(opt);
    
        let dataOutput = data.data.values;
        var temp=[]
    
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        var month = yesterday.toLocaleString('en-us', { month: 'long' });
        yesterday = yesterday.getDate()+"-"+month+"-"+yesterday.getFullYear();
        var row; var d=[]
    
        let newDataArray = dataOutput.map(function(element, index) {
            if(element[0] == yesterday) {
                row=index+1;
                temp[row]=tpsreport;
            }
        })
        
        const updateOptions ={
            spreadsheetId: 'YOUR_SPREADSHEET_ID',   //Spreadsheet to write to
                range: `Sheet1!B${row}`,    //Wrte to a new row each time by looking for date
                valueInputOption: 'USER_ENTERED',
                resource: {values: temp}
        }
        let res = await gsapi.spreadsheets.values.update(updateOptions)
        // console.log(res);
    
    }
}