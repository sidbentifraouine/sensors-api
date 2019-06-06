// Alexa Proactive API sample script

const https = require('https')
const mode = 'dev' // or 'prod'no

const clientID = `amzn1.application-oa2-client.776dfdba0f9b4d2f96e6f27b66aaff39`

const clientSecret = `15e40305c54bcde24ef2e1442026ec2277292c003b663a14e735bca9ee52fd39`

let userId1 = `amzn1.ask.account.AFKMLQ7C5EJKFQKWYMOHGTYEA5XJSCHLC7F6XSR5VCRRQQWN5GNGMNQDP3MZ54A3UIUJWP7WLRDYVF2JPV4MG2PT4EENZAFZGXAOLUNHWTQP3OU6P3J32LFYOJA2OJLFY6C4OY4QPRIO46ZG4AZ3SBIIQH4TDAOI6QHG2YSLOK44CTKPLI3DXBU2URY6SPK4O2MCRZSOMQ7X3UA`

async function notify(userId = userId1, eventType = 'ORDER', message = 3) {
  const token = await getToken()
  const status = await sendEvent(eventType, token, userId, message)

  return status
}

function getProactiveOptions(token, postLength) {
  return {
    hostname: 'api.eu.amazonalexa.com', // api.eu.amazonalexa.com (Europe) api.fe.amazonalexa.com (Far East)
    port: 443,
    path:
      '/v1/proactiveEvents/' +
      (mode && mode === 'prod' ? '' : 'stages/development'), // mode: global var
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postLength,
      Authorization: 'Bearer ' + token
    }
  }
}

function getProactivePostData(eventType, userId, message) {
  // console.log(`routing ${eventType} ${message}`);
  switch (eventType) {
    case 'ORDER':
      return getOrderStatusEvent(userId, message)
    // case "MEDIA":
    //     return getMediaEvent(message);
    // case "SPORTS":
    //     return getSportsEvent(userId, message);

    default:
      return getOrderStatusEvent(userId)
  }
}

function getOrderStatusEvent(userId, message) {
  let timestamp = new Date()
  let expiryTime = new Date()
  let arrivalDate = new Date()

  arrivalDate.setTime(arrivalDate.getTime() + message * 86400000)

  arrivalDate.setHours(0, 0, 0, 0)

  expiryTime.setMinutes(expiryTime.getMinutes() + 60)

  let referenceId = 'SampleReferenceId' + new Date().getTime() // cross reference to records in your existing systems
  const eventJson = {
    timestamp: timestamp.toISOString(),
    referenceId: referenceId,
    expiryTime: expiryTime.toISOString(),
    event: {
      name: 'AMAZON.OrderStatus.Updated',
      payload: {
        state: {
          status: 'ORDER_SHIPPED',
          deliveryDetails: {
            expectedArrival: arrivalDate.toISOString() // "2018-12-14T23:32:00.463Z"
          }
        },
        order: {
          seller: {
            name: 'localizedattribute:sellerName'
          }
        }
      }
    },
    localizedAttributes: [
      {
        locale: 'en-US',
        sellerName: 'Delivery Owl'
      },
      {
        locale: 'en-GB',
        sellerName: 'Delivery Owl UK'
      },
      {
        locale: 'fr-FR',
        sellerName: 'blablabla'
      }
    ],
    relevantAudience: {
      type: 'Unicast',
      payload: {
        user: userId
      }
    }
  }

  return eventJson
}

// ----------------------------------------------------------------------------

function getTokenOptions(postLength) {
  // const TokenPostData = getTokenPostData();
  return {
    hostname: 'api.amazon.com',
    port: 443,
    path: '/auth/O2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postLength // TokenPostData.length
    }
  }
}
function getTokenPostData() {
  return (
    'grant_type=client_credentials&client_id=' +
    clientID +
    '&client_secret=' +
    clientSecret +
    '&scope=alexa::proactive_events'
  )
}
// const TokenPostData  = 'grant_type=client_credentials&client_id=amzn1.application-oa2-client.45690dc26b6848419d11e3c3e51c4c76&client_secret=5571d04619803b123fc305f0b2a8b3ac4f91504f512c2faed7165ca54356aaff&scope=alexa::proactive_events';

function getToken() {
  return new Promise((resolve) => {
    const TokenPostData = getTokenPostData()
    const req = https.request(getTokenOptions(TokenPostData.length), (res) => {
      res.setEncoding('utf8')
      let returnData = ''

      res.on('data', (chunk) => {
        returnData += chunk
      })

      res.on('end', () => {
        // const tokenRequestId = res.headers['x-amzn-requestid']
        // console.log(`Token requestId: ${tokenRequestId}`);
        resolve(JSON.parse(returnData).access_token)
      })
    })
    req.write(TokenPostData)
    req.end()
  })
}

// ----------------------------------------------------------------------------

function sendEvent(eventType, token, userId, message) {
  return new Promise((resolve) => {
    const ProactivePostData = JSON.stringify(
      getProactivePostData(eventType, userId, message)
    )
    // console.log(`\nProactivePostData\n${JSON.stringify(JSON.parse(ProactivePostData), null, 2)}\n-----------`);

    const ProactiveOptions = getProactiveOptions(
      token,
      ProactivePostData.length
    )
    // console.log(`ProactiveOptions\n${JSON.stringify(ProactiveOptions, null, 2)}`);

    const req = https.request(ProactiveOptions, (res) => {
      res.setEncoding('utf8')

      if ([200, 202].includes(res.statusCode)) {
        // console.log('successfully sent event');
        console.log(`requestId: ${res.headers['x-amzn-requestid']}`)
      } else {
        console.log(`Error https response: ${res.statusCode}`)
        console.log(`requestId: ${res.headers['x-amzn-requestid']}`)

        if ([403].includes(res.statusCode)) {
          console.log(
            `userId ${userId}\nmay not have subscribed to this event. ${
              res.status
            }`
          )
        }
      }

      req.on('error', function(err) {
        console.log(err)
      })

      // let returnData
      // res.on('data', (chunk) => {
      //   returnData += chunk
      // })

      res.on('end', () => {
        //console.log(`return headers: ${JSON.stringify(res.headers, null, 2)}`);
        resolve(`sent event ${eventType}`)
      })
    })
    req.write(ProactivePostData)
    req.end()
  })
}

module.exports = notify
