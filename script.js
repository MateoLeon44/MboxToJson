const Mbox = require('node-mbox');
const mbox = new Mbox();
const fs = require('fs');
const path = require('path');

// wait for message events
const messages = {};
mbox.on('message', async function (msg) {
  const MailParser = require('mailparser').MailParser;
  let parser = new MailParser();
  let mailobj = {};

  parser.on('headers', (headers) => {
    let headerObj = {};
    for (let [k, v] of headers) {
      // We don’t escape the key '__proto__'
      // which can cause problems on older engines
      headerObj[k] = v;
    }
    //console.log(headerObj)
    if (headerObj.from.value[0]) {
      if (headerObj.from.value[0].address) {
        headerObj.from.value[0].address.replace(/\\n/g, '');
        mailobj.email_from = headerObj.from.value[0].address;
      } else {
        mailobj.email_from = '';
      }
      if (headerObj.from.value[0].name) {
        headerObj.from.value[0].name.replace(/\\n/g, '');
        mailobj.name_from = headerObj.from.value[0].name;
      } else {
        mailobj.name_from = '';
      }
    }
    if (headerObj.subject) {
      headerObj.subject.replace(/\\n/g, '');
    }
    mailobj.subject = headerObj.subject;
  });

  parser.on('data', (data) => {
    if (data.type !== 'attachment') {
      if(data.text){
        var x = data.text.replace(/\n|\r/g, "");
        var y = x.replace(/"/g, "'")
        var z = y.replace(/;/g, ':')
        mailobj.text = z;
      }
    }
  });

  parser.on('end', () => {
    // process.stdout.write(JSON.stringify(mailobj, (k, v) => (k === 'content' || k === 'release' ? undefined : v), 3));
    fs.appendFile('to_train.json', JSON.stringify(mailobj) + ',\n', (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;
      // success case, the file was saved
      // console.log('json updated!');
    });
  });
  parser.write(msg);
  parser.end();
});

// pipe stdin to mbox parser
/* const handle = fs.createReadStream("private-phishing4.mbox");
handle.pipe(mbox);  */

fs.readdir('./spam_2/', function (err, files) {
  if (err) throw err;

  files.forEach((file) => {
    const paths = path.join(__dirname, 'spam_2', file);
    const handle2 = fs.createReadStream(paths);
    handle2.pipe(mbox);
  });
});
