import libEnum from '../lib/enum.js';
import apiModule from './api.js';

const uriTemplate = {
  // http://192.168.0.100/api/oauth2/token
  // oauth2: '$baseURI/oauth2/token',
  // http://192.168.0.100/gap/nodes/?mac=CC:1B:E0:E0:DD:70&access_token=&active=1&event=1&chip=1
  scan: '$baseURI/gap/nodes/?mac=$mac&access_token=$access_token&active=1&event=1&chip=$chip&filter_mac=$filter_mac&filter_name=$filter_name&filter_rssi=$filter_rssi',
  // http://192.168.0.100/gap/nodes/C0:00:5B:D1:AA:BC/connection/?mac=CC:1B:E0:E0:DD:70&access_token=
  connect: '$baseURI/gap/nodes/$deviceMac/connection/?mac=$mac&access_token=$access_token',
};

const apiURI = {}; // 生成后的接口

function getBaseURI(devConf) {
  let url = devConf.serverURI;
  if (devConf.controlStyle === libEnum.controlStyle.AC) {
    url = url + '/api'; 
  }
  return url;
}

function updateApURI(_devConf) {
  _devConf.baseURI = getBaseURI(_devConf);
  for (let uri in uriTemplate) {
    apiURI[uri] = uriTemplate[uri];
    for (let field in _devConf) {
      apiURI[uri] = apiURI[uri].replace('$' + field, _devConf[field]);
    }
  }
  return Promise.resolve();
}

// 更新接口地址
function updateAcURI(_devConf) {
  _devConf.baseURI = getBaseURI(_devConf);
  return new Promise(function(resolve, reject) {
    apiModule.getAccessToken(_devConf.baseURI, _devConf.acDevKey, _devConf.acDevSecret).then(function(data) {
      _devConf.access_token = data.access_token;
      for (let uri in uriTemplate) {
        apiURI[uri] = uriTemplate[uri];
        for (let field in _devConf) {
          apiURI[uri] = apiURI[uri].replace('$' + field, _devConf[field]);
        }
      }
      resolve();
    }).catch(function(error) {
      reject(error);
    });
  });
}

function updateURI(_devConf) {
  if (_devConf.controlStyle === libEnum.controlStyle.AC) {
    return updateAcURI(_devConf);
  }
  return updateApURI(_devConf);
}

export default {
  apiURI,
  updateURI,
}