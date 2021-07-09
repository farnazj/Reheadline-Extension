import authServices from './services/authServices'
import titleServices from './services/titleServices'
import sourceServices from './services/sourceServices'
import relationServices from './services/relationServices'
import preferencesServices from './services/preferencesServices'
import studyServices from './services/studyServices'
import originServices from './services/originServices'

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Hello from the background')

  // browser.tabs.executeScript({
  //   file: 'content-script.js',
  // });

  if (request.type == 'login') {
    return new Promise((resolve, reject) => {
      authServices.login(request.data.reqBody)
      .then(res => {
        localStorage.setItem('trustnetAuthToken', JSON.stringify(res.data.user));
        resolve(res)
      })
      .catch(err => {
        console.log(err.response.data.message)
        reject({ message: err.response.data.message });
      })
    })
  }
  else if (request.type == 'logout') {
    return new Promise((resolve, reject) => {

      authServices.logout()
        .then(res => {
          localStorage.removeItem('trustnetAuthToken');
          resolve(res)
        })
        .catch(err => {
          reject({message: err});
        })
    })
  }
  else if (request.type == 'get_user') {
    return new Promise((resolve, reject) => {
      resolve(JSON.parse(localStorage.getItem('trustnetAuthToken')));
    })
  }
  else if (request.type == 'get_follows') {
    return new Promise((resolve, reject) => {
      relationServices.getFollows()
        .then(response => {
          resolve(response.data);
        })
    })
  }
  else if (request.type == 'get_trusteds') {
    return new Promise((resolve, reject) => {
      relationServices.getTrusteds()
        .then(response => {
          resolve(response.data);
        })
    })
  }
  else if (request.type == 'get_followers') {
    return new Promise((resolve, reject) => {
      let authUsername = JSON.parse(localStorage.getItem('trustnetAuthToken')).userName;
      relationServices.getFollowers({ username: authUsername })
      .then(response => {
        resolve(response.data);
      })
    })
  }
  else if (request.type == 'unfollow') {
    return new Promise((resolve, reject) => {
      relationServices.unfollow(request.data.reqBody)
      .then(response => {
        studyServices.logUserInteraction({ type: 'unfollow', data: request.data.id, client: 'extension' });
        resolve(response.data);
      })
    })
  }
  else if (request.type == 'get_title_hash_matches') {
    return new Promise((resolve, reject) => {
      titleServices.getTitleHashMatches(request.data)
      .then(response => {
        resolve(response.data);
      })
    })
  }
  else if (request.type == 'arrange_custom_titles') {
    return new Promise((resolve, reject) => {

      let resTitles = request.data;
      let titleObjects = [];
      let titlesBySetId = {};

      if (resTitles) {
        resTitles.forEach(title => {

          if (!(title.setId in titlesBySetId )) {
              let titleObj = {};
              titleObj['history'] = [];
              titlesBySetId[title.setId] = titleObj;
          }

          if (title.version != 1) {
            titlesBySetId[title.setId]['history'].push(title);
          }
          else {
            titlesBySetId[title.setId]['lastVersion'] = title;
          }
        })

        let allProms = [] ;
        for (const [setId, titleObj] of Object.entries(titlesBySetId)) {
          let titlesetProms = [
            sourceServices.getSourceById(titleObj['lastVersion'].SourceId),
            titleServices.hasUserEndorsedTitle({ setId: setId })
          ];

          allProms.push(Promise.all(titlesetProms)
          .then(resp => {
            titlesBySetId[setId]['author'] = resp[0].data;
            titlesBySetId[setId]['userEndorsed'] = resp[1].data;
            titleObjects.push(titlesBySetId[setId]);
          }))

        }
        Promise.all(allProms)
        .then(() => {
          resolve(titleObjects);
        });
      }

    })

  }

  else if (request.type == 'post_new_title') {
    return new Promise((resolve, reject) => {
  
      titleServices.postCustomTitle(request.data.reqBody)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject({ message: err });
      })
        
    })

  }
  else if (request.type == 'edit_title') {
    return new Promise((resolve, reject) => {
      titleServices.editCustomTitle(request.data.reqParams, request.data.reqBody)
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err);
      })
    })
  }
  else if (request.type == 'get_custom_titles_of_standalone_title') {
    return new Promise((resolve, reject) => {
        let activityUserName = JSON.parse(localStorage.getItem('trustnetAuthToken')).userName;
        let customTitleReqHeaders = {
          activityusername: activityUserName
        };
    
        titleServices.getCustomTitlesOfstandaloneTitle(request.data.reqBody,
        customTitleReqHeaders)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject({ message: err });
        })
    })
  }
  else if (request.type == 'delete_title') {
    return new Promise((resolve, reject) => {

      titleServices.deleteCustomTitle(request.data.reqBody)
      .then(res => {
        console.log('got the response', res)
        resolve(res);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  
  }
  else if (request.type == 'set_endorsement_status') {
    return new Promise((resolve, reject) => {
      titleServices.setEndorsementStatus(request.data.params, request.data.reqBody)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'has_user_endorsed_title') {
    return new Promise((resolve, reject) => {

      titleServices.hasUserEndorsedTitle(request.data.params)
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'get_preferences') {
    return new Promise((resolve, reject) => {
      preferencesServices.getPreferences()
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'set_preferences') {

    return new Promise((resolve, reject) => {
      preferencesServices.setPreferences(request.data.reqBody)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'is_url_whitelisted') {
    return new Promise((resolve, reject) => {
      originServices.isUrlWhiteListed(request.data.headers)
      .then(res => {
        console.log(res, res.data)
        resolve(res.data);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'add_url_to_whitelist') {
    return new Promise((resolve, reject) => {
      originServices.addUrlToWhiteLists(request.data.reqBody)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'log_interaction') {
    return new Promise((resolve, reject) => {
      studyServices.logUserInteraction({...request.interaction, client: 'extension'})
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
  else if (request.type == 'update_standalone_title_status') {
    return new Promise((resolve, reject) => {
      titleServices.updateStandaloneTitleStatus(request.data.params, request.data.reqBody)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject({ message: err });
      })
    })
  }
})
