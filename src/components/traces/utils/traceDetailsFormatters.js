/*
 * Copyright 2017 Expedia, Inc.
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

import _ from 'lodash';

import formatters from '../../../utils/formatters';

const traceDetailsFormatters = {};

traceDetailsFormatters.calculateStartTime = spans =>
    spans.reduce((earliestTime, span) =>
        (earliestTime ? Math.min(earliestTime, span.startTime) : span.startTime), null
    );


traceDetailsFormatters.calculateDuration = (spans, start) => {
    const end = spans.reduce((latestTime, span) =>
        (latestTime ? Math.max(latestTime, (span.startTime + span.duration)) : (span.startTime + span.duration)), null
    );
    const difference = end - start;
    return difference || 1;
};

traceDetailsFormatters.getTimePointers = (totalDuration) => {
    const pointerDurations = [0.0, 0.25, 0.50, 0.75, 1.0]
        .map(dur => (totalDuration * dur));
    const leftOffset = [0.12, 0.32, 0.52, 0.72, 0.92]
        .map(lo => (lo * 100));
    return leftOffset.map((p, i) => ({leftOffset: p, time: formatters.toDurationString(pointerDurations[i])}));
};

traceDetailsFormatters.spanTreeDepths = (spanTree, initialDepth) => {
    const initial = {};
    initial[spanTree.span.spanId] = initialDepth;
    if (spanTree.children.length === 0) return initial;
    return (spanTree.children || []).reduce((prevMap, child) => {
        const childDepths = traceDetailsFormatters.spanTreeDepths(child, initialDepth + 1);
        return {
            ...prevMap,
            ...childDepths
        };
    }, initial);
};

traceDetailsFormatters.createSpanTree = (span, trace, groupByParentId = null) => {
    const spansWithParent = _.filter(trace, s => s.parentSpanId);
    const grouped = groupByParentId !== null ? groupByParentId : _
        .groupBy(spansWithParent, s => s.parentSpanId);
    return {
        span,
        children: (grouped[span.spanId] || [])
            .map(s => traceDetailsFormatters.createSpanTree(s, trace, grouped))
    };
};

traceDetailsFormatters.calculateSpansDepth = (spans) => {
    const rootSpan = spans.find(span => !span.parentSpanId);
    const spanTree = traceDetailsFormatters.createSpanTree(rootSpan, spans);
    return traceDetailsFormatters.spanTreeDepths(spanTree, 1);
};

export default traceDetailsFormatters;
