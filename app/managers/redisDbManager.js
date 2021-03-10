const redis = require('redis');
const { promisify } = require("util");
const config = require('../../config/default');

const client = redis.createClient({
    port: config.redis.port,
    host: config.redis.host
});

const setUserAsync = promisify(client.hset).bind(client);
const getUserAsync = promisify(client.hget).bind(client);
const getUsersAsync = promisify(client.hvals).bind(client);
const getUsersKeysAsync = promisify(client.hkeys).bind(client);
const deleteUsersAsync = promisify(client.hdel).bind(client);

module.exports = {

    /**
     * Get all records from redis DB
     * @return {Promise}
     */
    getAll: function getAllFromDb() {
        return getUsersAsync('users')
            .then((data) => {
                let arr = [];
                data.forEach(item => {
                        arr.push(JSON.parse(item));
                })
                return arr;
            })
            .catch((err) => {throw new Error(err.message)});
    },

    /**
     * Get record by id from redis DB
     * @param id
     * @return {Promise}
     */
    getById: function getIdFromDb(id) {
        return getUserAsync('users', id)
            .then(data => {
                return JSON.parse([data]);
            })
            .catch((err) => {throw new Error(err.message)});
    },

    /**
     * Add new record to redis DB
     * @param name
     * @return {Promise}
     */
    setNewId: function setNewIdToDb(name) {
        return getUsersKeysAsync('users')
            .then((idsArr) => {
                let id = 0;
                idsArr.forEach((num) => {
                    if (+num > id) {id = +num}
                });
                id = (id === 0 && !idsArr.length) ? 0 : ++id;
                const user = {id: id, name};
                setUserAsync('users', id, JSON.stringify(user))
                    .catch((err) => {throw new Error(err.message)});
                return module.exports.getById(`${id}`);
            })
            .catch((err) => {throw new Error(err.message)});
    },

    /**
     * Update record into redis DB
     * @param id
     * @param name
     * @return {Promise}
     */
    updateId: function updateIdToDb(id,name) {
        setUserAsync('users', id, JSON.stringify({id: +id, name}))
            .catch((err) => {throw new Error(err.message)});
        return module.exports.getById(id);
    },

    /**
     * Remove record from redis DB
     * @param id
     * @return {Promise}
     */
    removeId: function removeIdInDb(id) {
        deleteUsersAsync('users', id)
            .catch((err) => {throw new Error(err.message)});
    }
};
