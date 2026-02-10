var base = 'http://light.icursors.net:8816';

/**
 * 调用牛腩信用分查询
 * @param {obj} params {type: 查询类型(name, qq, discord), value: 查询值, success: 成功时的handle(response => {}), failed: 失败时的bandle(err => {})}
 */
module.exports.check = function check(params) {
    fetch(base + '/newnan_credit/check', {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authKey: 'K4gSHZGZpJCXFqLC',
                type   : params.type,
                data   : params.value
            })
        })
        .then(params.success)
        .catch(params.failed);
};
