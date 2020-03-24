const express = require('express');
const {checkAccessToken, checkPermission} = require('../authorizationUtils');
const { check, validationResult } = require('express-validator');
const {insertReview, getReviews,updateReview,deleteReview} = require('../database/reviews');
const axios = require('axios');
const qs = require('querystring');

const router = express.Router();


const API={
  OAUTH_TOKEN:'https://toptal-ruiyang.auth0.com/oauth/token',
  GET_USERS:'https://toptal-ruiyang.auth0.com/api/v2/users',
  ASSIGN_ROLE:'https://toptal-ruiyang.auth0.com/api/v2/users/:user_id/roles',
  GET_ROLES:'https://toptal-ruiyang.auth0.com/api/v2/users/:user_id/roles',
  GET_ALL_ROLES:'https://toptal-ruiyang.auth0.com/api/v2/roles',
  DELETE_USER:'https://toptal-ruiyang.auth0.com/api/v2/users/:user_id',
};

async function getToken(){
  const requestBody = {
    grant_type:process.env.GRANT_TYPE,
    client_id:process.env.CLIENT_ID,
    client_secret:process.env.CLIENT_SECRET,
    audience:process.env.API_AUDIENCE
  }
  const response=await axios.post(API.OAUTH_TOKEN,qs.stringify(requestBody),{
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data.token_type+' '+response.data.access_token;
}

router.use(checkAccessToken(process.env.ISSUER, process.env.EXPENSE_API));

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// endpoint to return all reviews
router.get('/', checkPermission('view:users'),
  async (req, res) => {
    const token = await getToken();
    const response = await axios.get(API.GET_USERS,{
      headers: {
        'authorization': token
      }
    });
    const users = response.data;
    const axiosCalls=users.map(user=>axios.get(API.GET_ROLES.replace(':user_id',user.user_id),{
          headers: {
            'authorization': token,
            'cache-control': 'no-cache',
            'content-type': 'application/json'
          }
        }));
    axios.all(axiosCalls).then(axios.spread((...responses) => {
      responses.map((res, id) => {
        users[id].roles = res.data
      });
      res.send(users);
    }))
  });


router.put('/roles', checkPermission('view:users'),
  async (req, res) => {
    const token = await getToken();
    const response = await axios.get(API.GET_ALL_ROLES,{
      headers: {
        'authorization': token
      }
    });
    res.send(response.data);
  });

// endpoint to insert new review
router.post('/:id', checkPermission('change:roles'),
async (req, res) => {
    const roles = req.body;
  const token = await getToken();
    console.log(escape(API.ASSIGN_ROLE.replace(':user_id',req.params.id)));
    const response = await axios.post(API.ASSIGN_ROLE.replace(':user_id',req.params.id),roles,{
      headers: {
        'authorization': token,
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      }
    });
    console.log(response.data);
    res.send(response.data);
  });

router.delete('/:id/role', checkPermission('change:roles'),
  async (req, res) => {
    const roles = req.body;
    const token = await getToken();
    console.log(roles);
    const response = await axios.delete(API.ASSIGN_ROLE.replace(':user_id',req.params.id),{
      data:roles,
      headers: {
        'authorization': token,
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      }
    });
    console.log(response.data);
    res.send(response.data);
  });

router.delete('/:id', checkPermission('delete:users'),
  async (req, res) => {
    const token = await getToken();
    const response = await axios.delete(API.DELETE_USER.replace(':user_id',req.params.id),{
      headers: {
        'authorization': token,
      }
    });
    console.log(response.data);
    res.send(response.data);
  });

module.exports = router;
