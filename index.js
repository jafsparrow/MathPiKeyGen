
const getHw = require('hwid2');
const jwtt = require('jsonwebtoken');
const keygen = require('keygen');
const qiaRegedit = require('qiao-regedit');

function addOneYear(date, years) {
    date.setFullYear(date.getFullYear() + years);
    return date;
  }

const createKey = async() => {
    // Read the license year value from arguments or set the default to 1;
    let licenseValidYears = 1;
    if(process.argv[2]){
        licenseValidYears = parseInt(process.argv[2])
    
    }
  
    console.log('passed year values is ', licenseValidYears)
    // read the guid;
    const windowsGuid = getHw.getHwId();
    console.log('System unique GUID is  -> ', windowsGuid)
    // create a unique key using keygen.
   const uniqueKey =  keygen.url();
   console.log('Unique License Key generated is -->', uniqueKey)
    // create claim with the claimKey as the unique generated key.
    let currentDate = new Date()
    
    // add Mathdopi name and an expiry date to the claim.
    let licenseYearDate = addOneYear(currentDate,licenseValidYears)
    console.log('License ending date is -->', licenseYearDate)
    const regJwtClaims = {
        issuer: 'MathdotPi',
        expiry: licenseYearDate,
        key: uniqueKey,

    }

    // sign the the key with guid and store in the registry..
    const signedRegKey = jwtt.sign(regJwtClaims,windowsGuid);
    console.log('Registry key is --> ', signedRegKey);
    //  save the key at a particular windows registry.
    const registryLocation = 'HKCU\\Software\\Microsoft\\Mathpi\\CurrentVersion';
    console.log('Registry location to store the KEY -> ', registryLocation)
    const options = {
        key: registryLocation,
        name: 'chavi',
        data: signedRegKey,
      };
      try {
        qiaRegedit.addValue(options, (res) => {
            console.log(res);
            console.log('Registry jwt key has been added successfully')
          });
      } catch(error) {
        console.log('some error occured while adding the key to registry... try again')
      }

    // sign the envJWT key with the generated key and store in the environment variable. also add random key claims to confuse anybody tryig to decode it..
    const envJwtClaims = {
        issuer: 'MathdotPi',
        key: keygen.url(),
        date: new Date()

    }

    const envJwt = jwtt.sign(envJwtClaims,uniqueKey);
    console.log('Copy the following code to add to system variables');

    console.log(envJwt);
}   

createKey()

