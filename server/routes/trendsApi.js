/*
 * Copyright 2018 Expedia Group
 *
 *         Licensed under the Apache License, Version 2.0 (the "License");
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *
 *             http://www.apache.org/licenses/LICENSE-2.0
 *
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */

const express = require('express');

const config = require('../config/config');
const handleResponsePromise = require('./utils/apiResponseHandler').handleResponsePromise;

const trendsConnector = require(`../connectors/trends/${config.connectors.trends.connectorName}/trendsConnector`); // eslint-disable-line import/no-dynamic-require

const router = express.Router();

router.get('/trends/service/:serviceName/:type', (req, res, next) => {
    const {
        granularity,
        from,
        until
    } = req.query;

    handleResponsePromise(res, next, 'trends_service_SVC_TYPE')(
        () => trendsConnector.getServiceTrends(req.params.serviceName, granularity, from, until)
    );
});

router.get('/trends/service/:serviceName', (req, res, next) => {
    const {
        granularity,
        from,
        until
    } = req.query;

    handleResponsePromise(res, next, 'trends_service_SVC_TYPE')(
        () => trendsConnector.getServiceStats(req.params.serviceName, granularity, from, until)
    );
});

router.get('/trends/operation/:serviceName/:operationName', (req, res, next) => {
    const {
        granularity,
        from,
        until
    } = req.query;

    handleResponsePromise(res, next, 'trends_operation_SVC_OP')(
        () => trendsConnector.getOperationTrends(req.params.serviceName, req.params.operationName, granularity, from, until)
    );
});

router.get('/trends/operation/:serviceName', (req, res, next) => {
    const {
        granularity,
        from,
        until
    } = req.query;

    handleResponsePromise(res, next, 'trends_operation_SVC')(
        () => trendsConnector.getOperationStats(req.params.serviceName, granularity, from, until)
    );
});

module.exports = router;
