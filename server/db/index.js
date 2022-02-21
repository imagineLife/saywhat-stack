const { MongoClient } = require('mongodb');
const { GLOBAL_STATE } = require('./../global')

/*
  - setups up a db collection if not already present
    otherwise stores collection name in state var
*/
async function setupCollection({cName, db, state}){
  let thisCollection;
  try{
    thisCollection = await db.createCollection(cName)
    console.log(`DB: collection ${cName} setup`)
  }catch(e){
    if(e.codeName === 'NamespaceExists'){
      console.log(`DB: collection ${cName} already setup`)
      thisCollection = db.collection(cName);
    }else{
      console.log(e)
      console.log('DB ERROR: setupCollection for ',cName)
    }
  }finally{
    state[cName] = thisCollection;
  }
}
/*
  - setup db in a var & leaves room for more collections to be setup
*/
async function setupStores(mongoClient){
  console.log('SERVER: validating & setting up db & collections')
  let dbs = await getAndLogDBs(mongoClient)
  const SayWhatDb = mongoClient.db('SayWhat')

  GLOBAL_STATE.DBS.SayWhat = SayWhatDb;

  await setupCollection({
    cName: 'Users', 
    db: SayWhatDb,
    state: GLOBAL_STATE.Collections
  })
  await setupCollection({
    cName: 'Speeches', 
    db: SayWhatDb,
    state: GLOBAL_STATE.Collections
  })
}

function makeConnectionString({
  username,
  pw,
  host,
  port,
  authDB
}){
  // Error Handling
  if(typeof host === 'undefined' ||
    typeof port === 'undefined'){
      console.log(`missing vars: host: ${host}, port: ${port}`)
      
      throw 'Cannot create db connection with missing param';
    }
  if(
    !process.env.MONGO_AUTH &&
    (!username ||
    !pw ||
    !authDB)
  ){
    console.log(`Expected auth connection to db`)
    throw 'Cannot create db connection with missing param';
  }

  // no auth?!
  if(process?.env?.MONGO_AUTH?.toString() === 'false'){
    return `mongodb://${host}:${port}/?connectTimeoutMS=2500`;
  }

  //auth'd
  return `mongodb://${username}:${pw}@${host}:${port}/?authSource=${authDB}`;
}

async function getAndLogDBs(mongoClient) {
    databasesList = await mongoClient.db().admin().listDatabases();
    const { databases } = databasesList
    console.table(databases)
    return databases;
};

async function setupDB(connectionParams) {
  console.log('Connecting to db')
  
  try {
    // Connect
    const uriStr = makeConnectionString(connectionParams)
    const mongoClient = new MongoClient(uriStr);
    await mongoClient.connect();

    // store 
    GLOBAL_STATE.DB_CONNECTED = true;
    console.log('SERVER: Connected to mongo db!')
    await setupStores(mongoClient);

    return mongoClient;
  } catch (e) {
    console.log(`setupDB fn error:`)
    console.log(e);
  }
}

async function closeDBConnection(mongoClient){
  return await mongoClient.close()
}

module.exports = {
  makeConnectionString,
  setupDB,
  getAndLogDBs,
  closeDBConnection,
  setupStores,
  setupCollection
}