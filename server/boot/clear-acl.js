// the base model like the user model that is provided by loopback has acls which limits the user from accessing end points to relations like /users/{id}/comments . So, this is use to clear the base acls and istead use the user applied acls
exports.clearBaseACLs = function (ModelType, ModelConfig) {
  ModelType.settings.acls.length = 0;
  ModelConfig.acls.forEach(function (r) {
    ModelType.settings.acls.push(r);
  });
};
