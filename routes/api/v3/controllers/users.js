import express from 'express';

var router = express.Router();

// If the user is not logged in, return the json: { status: "loggedout" }
// If the user is logged in return status of "loggedin" and have "userInfo" with the users' "name" and "username"

router.get('/myIdentity', function(req, res) {
  const isAuthenticated = Boolean(req.session?.isAuthenticated);
  if (!isAuthenticated) {
    return res.json({ status: 'loggedout' });
  }

  const account = req.session?.account || {};
  const name =
    account.name ||
    account.idTokenClaims?.name ||
    account.idTokenClaims?.given_name ||
    account.username ||
    '';
  const username =
    account.username ||
    account.idTokenClaims?.preferred_username ||
    account.idTokenClaims?.upn ||
    '';

  return res.json({
    status: 'loggedin',
    userInfo: {
      name,
      username,
    },
  });
});

export default router;
