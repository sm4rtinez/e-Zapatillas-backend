'use strict';
const bcrypt 			= require('bcryptjs');
const jwt           	= require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('User', {
        name     : DataTypes.STRING,
        surname      : DataTypes.STRING,
        email     : {type: DataTypes.STRING, allowNull: true, unique: true, validate: { isEmail: {msg: "email invalid."} }},
        password  : DataTypes.STRING,
        rol_id  : DataTypes.INTEGER,
        address : DataTypes.STRING,
        enabled : DataTypes.BOOLEAN
    });

    Model.beforeSave(async (user, options) => {
        let err;
        if (user.changed('password')){
            let salt, hash
            [err, salt] = await to(bcrypt.genSalt(10));
            if(err) TE(err.message, true);

            [err, hash] = await to(bcrypt.hash(user.password, salt));
            if(err) TE(err.message, true);

            user.password = hash;
        }
    });

    Model.prototype.comparePassword = async function (pw) {
	
        let err, pass
        if(!this.password) TE('password not set');
	
        [err, pass] = await to(bcrypt.compare(pw, this.password));
        if(err) TE(err);

        if(!pass) TE('invalid password');


        return this;
    }

    Model.prototype.getJWT = function () {
        let expiration_time = parseInt(CONFIG.jwt_expiration);
        return "Bearer "+jwt.sign({user_id:this.id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
    };

    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return json;
    };

    return Model;
};