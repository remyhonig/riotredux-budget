import riot from 'riot';
import uuid from 'node-uuid';
import Sortable from 'sortablejs/Sortable'
import * as action from 'app/redux/action-creators';


riot.tag('main',
  `<div class="container-fluid">
    <div class="row">
        <div class="col-md-3 col-xs-12">
            <div class="panel">
                <div class="panel-body">
                    <ul class="nav nav-tabs nav-justified">
                        <li role="presentation" class="active"><a href="#">Timeline</a></li>
                        <li role="presentation"><a href="#">Budget</a></li>
                    </ul>
                </div>
                <ul class="list-group" store={opts.store} riot-tag="income-timeline"></ul>
            </div>

            <div class="panel">
                <div class="panel-body">
                    <ul class="nav nav-tabs nav-justified">
                        <li role="presentation" class="active"><a href="#">Planned</a></li>
                        <li role="presentation"><a href="#">Spent</a></li>
                        <li role="presentation"><a href="#">Remaining</a></li>
                    </ul>
                </div>
                <ul class="list-group" riot-tag="period-spent-summary"
                  store={opts.store}
                  period_id="{opts.store.getState().selectedPeriod}">
                </ul>
            </div>

        </div>

        <div class="col-md-6 col-xs-12">
            <period store={opts.store} period_id="{opts.store.getState().selectedPeriod}"></period>
        </div>

        <div class="col-md-3 col-xs-12">

            <div class="panel panel-default">
                <div class="panel-heading">
                    Elektriciteit
                </div>
                <div class="panel-body">
                    <div class="input-group">
                        <!--<span class="input-group-addon">€</span>-->
                        <input type="text" class="form-control" placeholder="Amount">
                        <div class="input-group-btn">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Action <span class="caret"></span></button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li><a href="#">Action</a></li>
                                <li><a href="#">Amount budgetted last month: € 0</a></li>
                                <li><a href="#">Outflow last month: € 0</a></li>
                                <li><a href="#">Total scheduled this month: € 0</a></li>
                                <li role="separator" class="divider"></li>
                                <li><a href="#">Balance to € 0: € 12</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>`,

  function(opts) {
    this.ordering = () => opts.store.getState().ordering;


    opts.store.subscribe(() => this.update());
  }
);
