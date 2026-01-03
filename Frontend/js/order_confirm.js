// order_confirm.js
// 取得 URL 參數中的訂單資訊並顯示
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', function() {
    const orderId = getQueryParam('order_id');
    const orderInfo = getQueryParam('order_info'); // 可擴充為 JSON 字串
    document.getElementById('order-id').textContent = orderId || '無';
    if (orderInfo) {
        try {
            const info = JSON.parse(orderInfo);
            let html = '<ul>';
            for (const key in info) {
                html += `<li>${key}：${info[key]}</li>`;
            }
            html += '</ul>';
            document.getElementById('order-info').innerHTML = html;
        } catch {
            document.getElementById('order-info').textContent = orderInfo;
        }
    }
});
