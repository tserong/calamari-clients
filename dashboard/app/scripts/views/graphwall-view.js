/*global define*/

define(['jquery', 'underscore', 'backbone', 'templates', 'helpers/graph-utils', 'models/application-model', 'marionette'], function($, _, Backbone, JST, gutils, models) {
    'use strict';

    var GraphwallView = Backbone.Marionette.ItemView.extend({
        template: JST['app/scripts/templates/graphwall-view.ejs'],
        className: 'graph-mode span12',
        ui: {
            'title': '.title'
        },
        initialize: function() {
            this.App = Backbone.Marionette.getOption(this, 'App');
            this.graphiteHost = Backbone.Marionette.getOption(this, 'graphiteHost');
            this.baseUrl = gutils.makeBaseUrl(this.graphiteHost);
            this.cpuTargets = gutils.makeTargets(gutils.makeCPUTargets(['system', 'user', 'idle']));
            this.heightWidth = gutils.makeHeightWidthParams(442, 266);
            this.makeCPUGraphUrl = gutils.makeGraphURL('png', this.baseUrl, this.heightWidth, this.cpuTargets);
            this.osdOpLatencyTargets = gutils.makeTargets(gutils.makeOpLatencyTargets(['op_r_latency', 'op_w_latency', 'op_rw_latency']));
            this.makeOpsLatencyGraphUrl = gutils.makeGraphURL('png', this.baseUrl, this.heightWidth, this.osdOpLatencyTargets);
            this.journalOpsTargets = gutils.makeTargets(gutils.makeFilestoreTargets(['journal_ops', 'journal_wr']));
            this.makeJournalOpsGraphUrl = gutils.makeGraphURL('png', this.baseUrl, this.heightWidth, this.journalOpsTargets);
            this.loadAvgTargets = gutils.makeTargets(gutils.makeLoadAvgTargets(['01', '05', '15']));
            this.makeLoadAvgGraphUrl = gutils.makeGraphURL('png', this.baseUrl, this.heightWidth, this.loadAvgTargets);
            this.memoryTargets = gutils.makeTargets(gutils.makeMemoryTargets(['Active', 'Buffers', 'Cached', 'MemFree']));
            this.makeMemoryGraphUrl = gutils.makeGraphURL('png', this.baseUrl, this.heightWidth, this.memoryTargets);
            this.cpuTargetModels = new models.GraphiteCPUModel(undefined, { graphiteHost: this.graphiteHost });
            this.ioTargetModels = new models.GraphiteIOModel(undefined, { graphiteHost: this.graphiteHost });
        },
        makeHostUrls: function(fn) {
            return function() {
                var hosts = this.App.ReqRes.request('get:hosts');
                return _.map(hosts, function(host) {
                    return fn(host);
                });
            };
        },
        selectors: ['0-1', '0-2', '1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'],
        imageLoader: function($el, url) {
            setTimeout(function() {
                $el.html('<i class="icon-spinner icon-spin icon-large icon-3x"></i>');
                var image = new Image();
                image.src = url;
                image.onload = function() {
                    $el.html(image);
                };
                image.onerror = function() {
                    $el.html('<i class="icon-exclamation icon-large icon-3x"></i>');
                };
            }, 0);
        },
        makeHostGraphUrl: function(host) {
            return function() {
                return [this.makeCPUGraphUrl(host), this.makeLoadAvgGraphUrl(host), this.makeMemoryGraphUrl(host)];
            };
        },
        hideGraphs: function() {
            this.$('.graph-card').css('visibility', 'hidden');
        },
        populateAll: function(title, fn) {
            var urls = fn.call(this);
            var self = this;
            this.ui.title.text(title);
            _.each(urls, function(url, index) {
                var $graph = self.$('.graph' + self.selectors[index]);
                $graph.css('visibility', 'visible');
                self.imageLoader($graph, url);
            });
        }
    });

    return GraphwallView;
});
