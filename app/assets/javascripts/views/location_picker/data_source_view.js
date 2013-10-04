//= require ./selector_view
chorus.views.LocationPicker.DataSourceView = chorus.views.LocationPicker.SelectorView.extend({
    templateName: "location_picker_data_source",
    constructorName: "LocationPickerDataSourceView",

    events: {
        "change select": "dataSourceSelected"
    },

    setup: function() {
        this._super('setup');

        this.dataSourceCollections = [];

        if(this.options.showHdfsDataSources) {
            this.collection = new (chorus.collections.Base.include(chorus.Mixins.MultiModelSet))();
            this.collectHdfsDataSources();
        } else {
            this.collection = new chorus.collections.Base();
        }

        if (this.options.showOracleDataSources) {
            this.collectDatabaseDataSources();
        } else {
            this.collectGpdbDataSources();
        }

        this.collection.comparator = function(dataSource) {
            return dataSource.name();
        };

        this.loading();
    },

    collectHdfsDataSources: function() {
        this.hdfsDataSources = new chorus.collections.HdfsDataSourceSet();
        this.hdfsDataSources.attributes.jobTracker = true;
        this.addDataSourceCollection(this.hdfsDataSources);
    },

    collectGpdbDataSources: function() {
        this.gpdbDataSources = new chorus.collections.GpdbDataSourceSet();
        this.addDataSourceCollection(this.gpdbDataSources);
    },
    
    collectDatabaseDataSources: function () {
        this.databaseDataSources = new chorus.collections.DataSourceSet();
        this.addDataSourceCollection(this.databaseDataSources);
    },
    
    addDataSourceCollection: function (dataSourceCollection) {
        this.dataSourceCollections.push(dataSourceCollection);
        this.onceLoaded(dataSourceCollection, this.resourcesLoaded);
        this.listenTo(dataSourceCollection, "fetchFailed", this.fetchFailed);
        dataSourceCollection.fetchAll();
    },

    dataSourceSelected: function() {
        this.trigger("clearErrors");
        var selectedDataSource = this.getSelectedDataSource();
        this.setSelection(selectedDataSource);
        this.trigger('change');
        if(!selectedDataSource || selectedDataSource.isSingleLevelSource()) {
            this.childPicker.hide();
        }
    },

    onSelection: function() {
        if (this.selection && !this.selection.isSingleLevelSource()) {
            this.childPicker.parentSelected(this.selection);
        }
    },

    getSelectedDataSource: function() {
        var dataSourceId = this.$('select option:selected').val();
        return this.collection && this.collection.get(dataSourceId);
    },

    allDataSourcesLoaded: function() {
        return _(this.dataSourceCollections).all(function(dataSourceSet) {
            return dataSourceSet.loaded;
        });
    },

    resourcesLoaded: function() {
        if(this.allDataSourcesLoaded()) {
            var models = this.dataSourceCollections.map(function(dataSourceSet) {
                return dataSourceSet.models;
            });

            this.collection.reset(_(models).flatten());
            this.collectionLoaded();
        }
    },

    fieldValues: function() {
        return {
            dataSource: this.selection && this.selection.get("id")
        };
    },

    selectionIsMissing: function(defaultValue) {
        var dataSourceExists = _(this.collection.models).any(function(dataSourceSet) {
            return (defaultValue !== undefined) && (dataSourceSet.get("id") === defaultValue.id) && (dataSourceSet.get("entityType") === defaultValue.entityType);
        });
        return !dataSourceExists;
    },

    modelIsSelected: function(defaultValue, model) {
        return (defaultValue && model.get("id") === defaultValue.id && model.get("entityType") === defaultValue.entityType);
    },

    ready: function() {
        var attrs = this.fieldValues();
        return !!attrs.dataSource;
    }
});