/** @jsx React.DOM */
var React = require('react');

var DataSource = require("./ds/datasource");
var dsFactory = require("./ds")
var Pager = require("./pager");

var RDTRow = require("./row");
var RDTColumn = require("./column");
var RDTBody = require("./body");
var Paginator = require("./paginator");



var TABLE_CSS = {
    pure: {
        table: 'pure-table pure-table-bordered'
    },
    'pure-striped': {
        table: 'pure-table pure-table-bordered pure-table-striped'
    },
    bootstrap: {
        table: 'table table-bordered'
    },
    foundation: {
        table: ''
    }
}

/**
 * Simple Data Table using react.
 *
 *
 *  var datasource = {
 *       data: []
 *   };
 *
 *  var config = {
 *      style : 'pure',
 *       cols : [
 *           { editable: true, property: "path" , header: "First Name"  }
        ]
    };
 *
 */
var RDT = React.createClass({
    componentWillReceiveProps : function(newProps) {
        //this.ds = new DataSource(newProps.config,newProps.datasource);
        if ( newProps.datasource ) {
            this.ds = newProps.datasource;
        }
        this.ds.on("recordAdded",this.onDsChangeEvent);
        this.ds.on("recordUpdated",this.onDsChangeEvent);
        if ( newProps.config.pager ) {
            this.pager = new Pager(1,newProps.config.pager.rowsPerPage,this.ds);
            return { pager : this.pager.state()  }
        }
        return { pager : null };
    },
    nextPage : function() {
        if ( this.pager ) {
            this.pager = this.pager.next();
            this.setState({ pager : this.pager.state() });
        }
    },

    add : function(record) {
        this.ds.add(record);
        var pagerState = null;
        if ( this.pager ) {
            pagerState = this.pager.state()
        }

        this.setState({ pager : pagerState });
    },

    onDsChangeEvent : function() {
        //listen and then notify listener
        if ( this.props.onChange ) {
            this.props.onChange();
        }
    },

    componentDidMount : function() {
        (this.props.datasource || dsFactory.fromArray([])).then(function(datasource) {
            this.setState({datasource : datasource});
        }.bind(this));
    },
    getInitialState: function () {

        var ds = new DataSource([]);
        var pager =  null; 
        if (this.props.config.pager  )
        if ( this.props.config.pager ) {
            pager = new Pager(1, this.props.config.pager.rowsPerPage, this.ds);
        }
        return { datasource : ds, pager :pager };
        
    },

    pagerUpdated : function(page) {
        if ( this.pager ) {
            this.pager = this.pager.toPage(page);
            this.setState({ pager : this.pager.state() });
        }
    },

    render: function () {

        var tableStyle = TABLE_CSS[this.props.config.style];
        var config = this.props.config;
        var datasource = this.state.datasource;

        var paginator = null;
        
        if ( this.state.pager ) {
            paginator =  <Paginator datasource={datasource} config={this.props.config} pageChangedListener={this.pagerUpdated}/> ;

        }

        return (
            <div>
                <div className="rdt-container" ref="container">
                    <table className={tableStyle['table']}>
                        <RDTColumn config={config} />
                        <RDTBody config={config} datasource={datasource} pager={this.state.pager}/>
                    </table>
                </div>
                {paginator}
            </div>
        )

    },



    /**
     * Return the underlying datasource if argument is null or use the new datasource provided
     *
     *
     * @returns {*|Function|datasource|RDT.getInitialState.datasource|paginator.datasource|RDT.render.datasource}
     */
    datasource : function(datasource) {
        if ( !datasource ) {
            return this.state.datasource;
        } 
        this.setState({datasource: datasource});
        return datasource;
    }
});


module.exports = RDT;
