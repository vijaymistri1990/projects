'use strict';
const https = require('https');
const querystring = require('querystring');

const shopify_call = (accessToken, shop, api_endpoint, query = {}, method = 'GET', request_headers = {}, is_log = 0, api_calls = 0) => {
    return new Promise((resolve, reject) => {
        try {
            let BackError = new Error();
            if (method != 'GET' && ['POST', 'PUT'].indexOf(method) !== -1 && api_calls == 0) {
                query = JSON.stringify(query);
                request_headers['Content-Length'] = query.length
            }
            let headers = Object.assign({}, request_headers, {
                /*"X-Shopify-Access-Token": accessToken,*/
                'User-Agent': 'Mozilla/5.0',
                'Content-Type': 'application/json'
            });

            let url = `https://${shop}${api_endpoint}`;
            if (api_endpoint.indexOf('oauth') == -1) {
                headers['X-Shopify-Access-Token'] = accessToken
            }
            /* Api version log if not 2021-07 */
            if (url.indexOf('2021-10') === -1 && api_calls == 0 && url.indexOf('oauth') == -1) {
                BackError.message = 'The api version is not 2021-10';
                let log_data = {
                    'date': new Date().toISOString(),
                    'url': url,
                    'Error': BackError.stack
                };
                let log = {
                    'type': '0',
                    'log': JSON.stringify(log_data)
                };
            }

            let call_parameter = {
                hostname: shop,
                path: api_endpoint,
                method: method,
                headers: headers
            };
            if (query && ['GET', 'DELETE'].includes(method) && api_calls == 0) {
                call_parameter.path = api_endpoint + "?" + querystring.stringify(query);
            }

            const req = https.request(call_parameter, res => {
                console.log("res=============================>", res.statusCode)
                if ([200, 201, 202, 429].indexOf(res.statusCode) == '-1') {
                    if (is_log) {
                        console.log({
                            'status': res.statusCode,
                            'message': res.statusMessage,
                            'headers': res.headers
                        })
                    }
                    BackError.message = 'Status code is not 200,201,202,429.';
                    let log_data = {
                        'date': new Date().toISOString(),
                        'url': url,
                        'Error': BackError.stack,
                        'statusCode': res.statusCode,
                        'statusMessage': res.statusMessage,
                    };
                    let log = {
                        'type': '1',
                        'log': JSON.stringify(log_data)
                    }
                    resolve({
                        'status': res.statusCode,
                        'headers': res.headers,
                        'response': res.statusMessage
                    });
                } else {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    })
                    res.on('end', () => {
                        if (is_log) {
                            console.log({
                                'status': res.statusCode,
                                'message': res.statusMessage,
                                'headers': res.headers,
                                'response': JSON.parse(data)
                            })
                        }
                        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 202) {
                            if (typeof res.headers['x-shopify-api-deprecated-reason'] !== 'undefined') {
                                BackError.message = 'x-shopify-api-deprecated-reason';
                                let log_data = {
                                    'date': new Date().toISOString(),
                                    'url': url,
                                    'Error': BackError.stack
                                };
                                let log = {
                                    'type': '2',
                                    'log': JSON.stringify(log_data)
                                }
                                console.log(log);
                            }
                            /* Api version deprecation warning */
                            if (typeof res.headers['x-shopify-api-version-warning'] !== 'undefined') {
                                BackError.message = 'x-shopify-api-version-warning';
                                let log_data = {
                                    'date': new Date().toISOString(),
                                    'url': url,
                                    'Error': BackError.stack,
                                };

                            }
                            resolve({
                                'status': res.statusCode,
                                'headers': res.headers,
                                'response': JSON.parse(data)
                            });
                        } else if (res.statusCode == 429) {
                            if (api_calls >= 1) {
                                BackError.message = 'api limit reached after two try';
                                let log_data = {
                                    'date': new Date().toISOString(),
                                    'url': url,
                                    'Error': BackError.stack,
                                    'api_calls': api_calls,
                                };
                                let log = {
                                    'type': '2',
                                    'log': JSON.stringify(log_data)
                                }
                                console.log(log);

                                resolve({
                                    'status': res.statusCode,
                                    'headers': res.headers,
                                    'response': JSON.parse(data)
                                });
                            } else {
                                api_calls++;
                                let retryAfter = res.headers['retry-after'] * 1000 || 2000;
                                BackError.message = 'api limit reached after first try';
                                let log_data = {
                                    'date': new Date().toISOString(),
                                    'url': url,
                                    'Error': BackError.stack,
                                    'api_calls': api_calls
                                };
                                let log = {
                                    'type': '1',
                                    'log': JSON.stringify(log_data)
                                }
                                console.log(log);

                                setTimeout(() => {
                                    let data = shopify_call(accessToken, shop, api_endpoint, query, method, request_headers, is_log, api_calls);
                                    resolve(data);
                                }, retryAfter);
                            }
                        } else {
                            /** We never come at here. But if some wrong and header goes update then we need to resolve Promise */
                            resolve({
                                'status': 0,
                                'headers': {},
                                'response': {}
                            })
                        }
                    });
                }
            })
            if (method != 'GET' && ['POST', 'PUT'].indexOf(method) !== -1) {
                req.write(query);
            }
            req.on('error', error => {
                console.log("errrorr........", error);
                let log_data = {
                    'date': new Date().toISOString(),
                    'url': url,
                    'Error': error
                };
                let log = {
                    'type': '2',
                    'log': JSON.stringify(log_data)
                }
                console.log(log);

                resolve({
                    'status': 1,
                    'headers': {},
                    'response': error
                });
            })
            req.end()
        } catch (e) {
            let log_data = {
                'date': new Date().toISOString(),
                'url': `https://${shop}${api_endpoint}`,
                'Error': e.stack
            };
            let log = {
                'type': '3',
                'log': JSON.stringify(log_data)
            }
            console.log("log=========catch===========>", log);

            resolve({
                'status': 1,
                'headers': {},
                'response': ''
            });
        }
    })
}
module.exports = {
    shopify_call
};