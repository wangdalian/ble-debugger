<template>
  <div id="app" v-cloak>
    <el-container style="height: 100%">
      <el-header style="height: 67px; width: 100%;
          background-color: #212637;
          color: #fff;
          vertical-align: middle;
          line-height: 67px;
          border-bottom: 1px solid #1e2946;
          position: fixed;
          z-index: 999;
          ">
        <span style="width: 80px; text-align: center; ">
            <img :src="require('./assets/img/cassia.png')" style="vertical-align: middle; width: 38px; height: 38px; margin-top: -10px;"></img>
        </span>
        <span style="font-size: 22px;">
        {{ $t('message.title') }}
        </span>
        <span style="float: right;">Language
          <el-select @change="changeLanguage" v-model="store.devConfDisplayVars.language" size="small" style="width: 120px; padding-right: 15px;">
            <el-option label="中文" value="cn"></el-option>
            <el-option label="English" value="en"></el-option>
          </el-select>   
        </span>
      </el-header>
      <el-container>
        <el-aside style="width: 350px; border-right: 1px solid #f2f2f2; background-color: #f4f5f6; height: 100%; position: fixed; z-index: 999; top: 67px; 
          z-index: 3;" v-show="this.store.devConfDisplayVars.isConfigMenuItemOpen">
          <el-container style="height: 100%; width: 100%;">
            <el-main>
              <el-form label-width="85px" size="small">
              <el-row style="font-size: 16px; border-bottom: 1px solid #ddd; margin-top: 10px;">
                <span>{{ $t('message.configConnectParams') }}</span>
              </el-row>
              <el-form-item :label="$t('message.connectStyle')" style="margin-top: 15px;">
                <el-select v-model="store.devConf.controlStyle" style="width: 100%">
                  <el-option label="Router" value="ap"></el-option>
                  <el-option label="AC" value="ac"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('message.serviceURI')" style="margin-top: 15px;">
                <el-input v-model="store.devConf.serverURI" class="server-ip" clearable placeholder="http://192.168.0.100"></el-input>
              </el-form-item>
              <el-form-item :label="$t('message.devKey')" v-show="store.devConf.controlStyle === 'ac'"  style="margin-top: 15px;">
                <el-input v-model="store.devConf.acDevKey" class="ac-dev-key" clearable></el-input>
              </el-form-item>
              <el-form-item :label="$t('message.devSecret')" v-show="store.devConf.controlStyle === 'ac'"  style="margin-top: 15px;">
                <el-input v-model="store.devConf.acDevSecret" class="ac-dev-secret" clearable></el-input>
              </el-form-item>
              <el-form-item :label="$t('message.apMac')" v-show="store.devConf.controlStyle === 'ac'"  style="margin-top: 15px;">
                <el-input v-model="store.devConf.mac" class="ap-mac" placeholder="CC:1B:E0:E0:DD:70" clearable></el-input>
              </el-form-item>
              <el-row style="font-size: 16px; border-bottom: 1px solid #ddd; margin-top: 50px;">
                <span>{{$t('message.configScanParams')}}</span>
              </el-row>
              <el-form-item :label="$t('message.useChip')" style="margin-top: 15px;">
                <el-select v-model="store.devConf.chip" style="width: 100%">
                  <el-option label="0" value="0"></el-option>
                  <el-option label="1" value="1"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('message.filterName')" style="margin-top: 15px;">
                <el-select v-model="store.devConf.filter_name" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')" :placeholder="$t('message.pleaseInput')" multiple filterable allow-create default-first-option style="width: 100%">
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('message.filterMac')">
                <el-select v-model="store.devConf.filter_mac" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')" :placeholder="$t('message.pleaseInput')" multiple filterable allow-create default-first-option style="width: 100%">
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('message.fitlerRSSI')">
                <el-slider
                    v-model="store.devConf.filter_rssi"
                    :min="-85"
                    :max="0">
                  </el-slider>
              </el-form-item>
              </el-form>
            </el-main>
            <el-footer style="background-color: #ddd; width: 350px; height: 50px; line-height: 50px; vertial-align: middle; text-align: center; position: fixed; bottom: 0; left: 0;">
              <el-button type="danger" size="small" @click="reboot" style="margin-right: 30px;">{{$t('message.restartAP')}}</el-button>
              <!--<el-button type="primary" size="small" @click="apInfo" style="margin-right: 20px;">AP 信息</el-button>-->
              <el-button type="primary" size="small" @click="startScan" v-show="!store.devConfDisplayVars.isScanning">{{$t('message.startScan')}}</el-button>
              <el-button type="danger" size="small" @click="stopScan" v-show="store.devConfDisplayVars.isScanning">{{$t('message.stopScan')}}</el-button>
            </el-footer>
          </el-container>
        </el-aside>
        <el-main :style="{'background-color': '#fff', 'padding': 0, 'margin-left': this.store.devConfDisplayVars.isConfigMenuItemOpen ? '350px' : '0px', 'margin-top': '67px'}">
          <el-container style="height: 100%; background-color: #fff">
            <el-aside width="80px" style="height: 100%; background-color: #fff; position: fixed; z-index: 999;">
              <el-menu
                collapse
                @select="menuSelect"
                background-color="#212637"
                text-color="#ffffff"
                active-text-color="#2897ff"
                default-active="scanListMenuItem"
                class="el-menu-vertical-demo">
                <el-menu-item index="configMenuItem">
                  <i class="el-icon-s-fold" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">{{$t('message.configParams')}}</span>
                </el-menu-item>
                <el-menu-item index="scanListMenuItem">
                  <i class="el-icon-search" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">{{$t('message.scanList')}}</span>
                </el-menu-item>
                <el-menu-item index="connectListMenuItem">
                  <i class="el-icon-connection" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">{{$t('message.connectList')}}</span>
                </el-menu-item>
                <el-menu-item index="notifyListMenuItem">
                  <i class="el-icon-message-solid" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">{{$t('message.notifyList')}}</span>
                </el-menu-item>
                <el-menu-item index="apiLogListMenuItem">
                  <i class="el-icon-s-order" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">{{$t('message.apiLogList')}}</span>
                </el-menu-item>
                <el-menu-item index="apiDebuggerMenuItem">
                  <i class="el-icon-cpu" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">{{$t('message.apiDebugger')}}</span>
                </el-menu-item>
                <el-menu-item index="apiDemoMenuItem">
                  <i class="el-icon-s-help" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">{{$t('message.apiDemo')}}</span>
                </el-menu-item>
                <el-menu-item index="toolsMenuItem">
                  <i class="el-icon-s-opportunity" style="font-size: 24px; color: #fff;"></i>
                  <span slot="title">{{$t('message.tools')}}</span>
                </el-menu-item>
              </el-menu>
            </el-aside>
            <el-main style="height: 100%; margin-left: 80px;">
              <el-tabs style="background-color: #fff"	v-model="store.devConfDisplayVars.scanTabsActiveTab" @tab-click="scanTabsClick" v-show="store.devConfDisplayVars.activeMenuItem === 'scanListMenuItem'">
                <el-tab-pane name="scanResult" style="height: 100%; background-color: #fff; " >
                  <span slot="label"><i :class="store.devConfDisplayVars.scanTabsActiveTab === 'scanResult' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.scanResult')}}</span>
                  <vxe-toolbar>
                    <template v-slot:buttons>
                      <span>{{$t('message.devicesCount')}}: <span style="font-weight: bold; color: #409eff">{{ getComputedScanDisplayResultList.length }} </span></span>
                      <vxe-input v-model="cache.scanDisplayFilterContent" type="search" :placeholder="$t('message.searchMacOrName')" size="small"></vxe-input>
                      <vxe-button @click="scanDisplayResultExport" status="primary" size="small">{{$t('message.export')}}</vxe-button>
                      <vxe-button @click="scanDisplayResultClear" status="danger" size="small">{{$t('message.clear')}}</vxe-button>
                    </template>
                  </vxe-toolbar>
                  <!-- 注意设置为固定高度，否则页面在过多的数据时候会造成卡顿，TODO: 是否考虑使用分页优化? -->
                  <vxe-grid 
                    border="none"
                    show-overflow
                    stripe
                    highlight-hover-row
                    :header-row-style="{'background-color': '#f4f5f6'}"
                    height="560px"
                    ref="refScanDisplayResultGrid"
                    :sort-config="{trigger: 'cell'}"
                    :data="getComputedScanDisplayResultList">
                    <vxe-table-column field="name" :title="$t('message.name')" type="html" width="25%" sortable></vxe-table-column>
                    <vxe-table-column field="mac" :title="$t('message.addr')" type="html" width="30%" show-overflow></vxe-table-column>
                    <vxe-table-column field="bdaddrType" :title="$t('message.type')" width="15%" sortable></vxe-table-column>
                    <vxe-table-column field="rssi" :title="$t('message.signal')" width="15%" sortable></vxe-table-column>
                    <!-- 暂时不显示广播包了，没有找到合适位置，上面的字段自定义slot，数据量大的话会卡顿 -->
                    <!-- <vxe-table-column field="adData" title="广播包" :width="store.devConfDisplayVars.adDataWidth" show-overflow></vxe-table-column> -->
                    <vxe-table-column :title="$t('message.operation')" width="15%">
                      <template v-slot="{ row }">
                        <vxe-button status="primary" size="small" @click="connectDeviceByRow(row, row.mac)" :loading="cache.devicesConnectLoading[row.mac]">{{$t('message.connect')}}</vxe-button>
                      </template>
                    </vxe-table-column>
                    <template v-slot:empty>
                      <span>
                        <p>{{$t('message.noData')}}</p>
                      </span>
                    </template>
                  </vxe-grid>
                </el-tab-pane>
                <el-tab-pane name="rssiChart" style="width: 100%;">
                  <span slot="label"><i :class="store.devConfDisplayVars.scanTabsActiveTab === 'rssiChart' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.rssiChart')}}</span>
                  <el-row>
                    <el-form inline size="small">
                      <el-form-item :label="$t('message.statsCycle')">
                        <el-select v-model="store.devConfDisplayVars.rssiChartPeriod" :placeholder="$t('message.statsCycle')" style="width: 100px;">
                          <el-option :label="$t('message.seconds60')" value="60"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item :label="$t('message.statsInterval')">
                        <el-select v-model="store.devConfDisplayVars.rssiChartDataSpan" :placeholder="$t('message.statsInterval')" @change="rssiChartDataSpanChange" style="width: 100px;">
                          <el-option :label="$t('message.millseconds200')" value="200"></el-option>
                          <el-option :label="$t('message.millseconds500')" value="500"></el-option>
                          <el-option :label="$t('message.seconds1')" value="1000"></el-option>
                          <el-option :label="$t('message.seconds2')" value="2000"></el-option>
                          <el-option :label="$t('message.seconds5')" value="5000"></el-option>
                          <el-option :label="$t('message.seconds10')" value="10000"></el-option>
                          <el-option :label="$t('message.seconds30')" value="30000"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item>
                        <el-button v-show="!store.devConfDisplayVars.rssiChartSwitch" size="small" @click="destoryAndCreateRssiChart" type="primary">{{$t('message.open')}}</el-button>
                        <el-button v-show="store.devConfDisplayVars.rssiChartSwitch && !store.devConfDisplayVars.rssiChartStopped" size="small" @click="stopRssiChart" type="primary">{{$t('message.stop')}}</el-button>
                        <el-button v-show="store.devConfDisplayVars.rssiChartSwitch && store.devConfDisplayVars.rssiChartStopped" size="small" @click="startRssiChart" type="primary">{{$t('message.continue')}}</el-button>
                        <el-button v-show="store.devConfDisplayVars.rssiChartSwitch" size="small" @click="destoryRssiChart" type="primary">{{$t('message.close')}}</el-button>
                      </el-form-item>
                    </el-form>
                  </el-row>
                  <v-chart :options="chartOptions" ref="rssiChart" :autoresize="true" style="width: 100%; height: 500px; "></v-chart>
                </el-tab-pane>
              </el-tabs>
              <el-tabs @tab-click="connectTabsClick" v-model="cache.currentConnectedTab" @tab-remove="connectedListTabRemove" v-show="store.devConfDisplayVars.activeMenuItem === 'connectListMenuItem'">
                <el-tab-pane name="connectTab0" :closable="false">
                  <span slot="label"><i :class="cache.currentConnectedTab === 'connectTab0' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.connectList')}} </span>
                  <vxe-toolbar>
                    <template v-slot:buttons>
                      <span>{{$t('message.connectedDevices')}}: <span style="font-weight: bold; color: #409eff">{{ getComputedConnectDisplayResultList().length }} </span></span>
                      <vxe-input v-model="cache.connectDisplayFilterContent" type="search" :placeholder="$t('message.searchMacOrName')" size="small"></vxe-input>
                      <vxe-button @click="connectDisplayResultExport" status="primary" size="small">{{$t('message.export')}}</vxe-button>
                      <vxe-button status="danger" size="small">{{$t('message.clear')}}</vxe-button>
                      <vxe-button @click="disconnectAll" status="danger" size="small">{{$t('message.disconnectAll')}}</vxe-button>
                    </template>
                  </vxe-toolbar>
                  <!-- 注意设置为固定高度，否则页面在过多的数据时候会造成卡顿，TODO: 是否考虑使用分页优化? -->
                  <vxe-grid 
                    border="none"
                    show-overflow
                    stripe
                    highlight-hover-row
                    height="560px"
                    :header-row-style="{'background-color': '#f4f5f6'}"
                    ref="refConnectDisplayResultGrid"
                    :sort-config="{trigger: 'cell'}"
                    :data="getComputedConnectDisplayResultList()">
                    <vxe-table-column field="name" :title="$t('message.name')" type="html" width="15%" sortable></vxe-table-column>
                    <vxe-table-column field="mac" :title="$t('message.addr')" type="html" width="20%" show-overflow></vxe-table-column>
                    <vxe-table-column field="chip" :title="$t('message.chip')" type="html" width="15%" sortable></vxe-table-column>
                    <vxe-table-column field="bdaddrType" :title="$t('message.type')" width="10%" sortable></vxe-table-column>
                    <vxe-table-column :title="$t('message.operation')" width="40%">
                      <template v-slot="{ row }">
                        <el-button-group>
                          <el-button type="primary" size="small" @click="getDeviceServices(row.mac)">{{$t('message.services')}}</el-button>
                          <el-button type="primary" size="small" @click="disconnectDevice(row.mac)">{{$t('message.disconnect')}}</el-button>
                          <el-button type="primary" size="small" @click="pair(row.mac)">{{$t('message.pair')}}</el-button>
                          <el-button type="primary" size="small" @click="unpair(row.mac)">{{$t('message.unpair')}}</el-button>
                          <el-button type="primary" size="small" @click="exportDeviceServices(device.mac)">{{$t('message.export')}}</el-button>
                        </el-button-group>
                      </template>
                    </vxe-table-column>
                    <template v-slot:empty>
                      <span>
                        <p>{{$t('message.noData')}}</p>
                      </span>
                    </template>
                  </vxe-grid>
                </el-tab-pane>
                <el-tab-pane :closable="true" v-for="(device, index) in cache.connectedList" :key="device.mac" :name="device.mac">
                  <span slot="label"><i :class="cache.currentConnectedTab === device.mac ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{ device.mac }}</span>
                  <el-row style="background-color: #409eff; font-size: 14px; font-style: normal; border-radius: 3px; color: #fff; height: 60px; display: flex; align-items: center; padding-left: 15px; padding-right: 15px;">
                    <el-col :span="6">
                      <el-row>{{ device.name }}</el-row>
                      <el-row style="font-style:normal">{{ device.mac }}</el-row>
                    </el-col>
                    <el-col :span="3">{{ device.bdaddrType }}</el-col>
                    <el-col :span="3">chip{{ device.chip }}</el-col>
                    <el-col :span="12">
                      <el-button-group style="float: right; ">
                        <el-button size="small" @click="getDeviceServices(device.mac)" style="color: #2897ff">{{$t('message.services')}}</el-button>
                        <el-button size="small" @click="disconnectDevice(device.mac)" style="color: #2897ff">{{$t('message.disconnect')}}</el-button>
                        <el-button size="small" @click="pair(device.mac)" style="color: #2897ff">{{$t('message.pair')}}</el-button>
                        <el-button size="small" @click="unpair(device.mac)" style="color: #2897ff">{{$t('message.unpair')}}</el-button>
                        <el-button size="small" @click="exportDeviceServices(device.mac)" style="color: #2897ff">{{$t('message.export')}}</el-button>
                      </el-button-group>
                    </el-col>
                  </el-row>
                  <el-row style="padding-left: 0px; margin-top: 15px; ">
                    <el-collapse>
                      <el-collapse-item v-for="(service, index) in cache.devicesServiceList[device.mac]" :key="service.uuid">
                        <template slot="title">
                          <el-col style="padding-left: 5px; font-size: 14px; font-style: normal;">{{ service.uuid }}</el-col>
                          <el-col style="float: right; font-size: 14px; font-style: normal;">{{ service.name }}</el-col>
                        </template>
                        <el-row style="background-color: #e6e6e6; padding: 15px; border-bottom: 1px solid #fff" v-for="(char, index) in service.characteristics" title="char.name" :key="char.uuid">
                          <el-row style="font-size: 14px; font-weight: bold; font-style: normal;">{{ char.name }}</el-row>
                          <el-row style="font-size: 12px; font-style: normal;">UUID: {{ char.uuid }}</el-row>
                          <el-row style="font-size: 12px; font-style: normal;">HANDLE: {{ char.handle }}</el-row>
                          <el-row style="font-size: 12px; font-style: normal; ">
                            Properties: 
                            <el-button-group>
                              <el-button style="font-style: normal; font-weight: bold;" v-show="char.propertiesStr.includes('READ')" type="primary" size="small" @click="propertyClick('READ', device.mac, char)">
                                READ
                              </el-button>
                              <el-button style="font-style: normal; font-weight: bold;" v-bind:type="char.notifyStatus === 'on' ? 'primary' : 'info'" v-show="char.propertiesStr.includes('NOTIFY')" size="small" @click="propertyClick('NOTIFY', device.mac, char)">
                                NOTIFY
                              </el-button>
                              <el-button style="font-style: normal; font-weight: bold;" v-bind:type="char.notifyStatus === 'on' ? 'primary' : 'info'" v-show="char.propertiesStr.includes('INDICATE')" size="small" @click="propertyClick('INDICATE', device.mac, char)">
                                INDICATE
                              </el-button>
                              </el-switch>
                              <el-button style="font-style: normal; font-weight: bold;" v-show="char.propertiesStr.includes('WRITE NO RES')" type="primary" size="small" @click="propertyClick('WRITE NO RES', device.mac, char)">
                                WRITE NO RES
                              </el-button>
                              <el-button style="font-style: normal; font-weight: bold;" v-show="char.propertiesStr.includes('WRITE')" type="primary" size="small" @click="propertyClick('WRITE', device.mac, char)">
                                WRITE
                              </el-button>
                            </el-button-group>
                            <el-radio-group v-show="char.propertiesStr.includes('WRITE') || char.propertiesStr.includes('WRITE NO RES')" style="float: right" size="small" v-model="char.writeValueType">
                              <el-radio-button label="hex">HEX</el-radio-button>
                              <el-radio-button label="text">TEXT</el-radio-button>
                            </el-radio-group>
                            <el-input v-show="char.propertiesStr.includes('WRITE') || char.propertiesStr.includes('WRITE NO RES')" clearable style="width: 220px; float: right; font-size: 12px; font-style: normal;" size="small" v-model="char.writeValue" :placeholder="char.writeValueType === 'hex' ? '格式：aa00bb11cc22（支持空格）' : '格式：任意字符'">
                            </el-input>
                          </el-row>
                          <el-row style="font-size: 12px; font-style: normal; color: #409eff" v-show="char.readValue.toString().length !== 0">
                            Value: (0x) 
                            <el-popover trigger="click" width="600" placement="right">
                              <el-table :data="char.parsedReadValues" width="100%" stripe :empty-text="$t('message.noParser')">
                                <el-table-column :label="$t('message.field')" width="180">
                                  <template slot-scope="scope">
                                    <span>{{ scope.row.name }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column :label="$t('message.parse')" width="300">
                                  <template slot-scope="scope">
                                    <span>{{ scope.row.parsed }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column label="HEX(0x)" width="120">
                                  <template slot-scope="scope">
                                    <span>{{ scope.row.raw }}</span>
                                  </template>
                                </el-table-column>
                              </el-table>
                              <el-button slot="reference" type="text">
                                {{ char.readValue }}
                              </el-button>
                            </el-popover>
                          </el-row>
                        </el-row>
                      </el-collapse-item>
                    </el-collapse>
                  </el-row>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-show="store.devConfDisplayVars.activeMenuItem === 'notifyListMenuItem'">
                <el-tab-pane>
                  <span slot="label"><i class="el-icon-caret-bottom"></i> {{$t('message.notifyList')}}</span>
                  <el-row>
                    <vxe-toolbar>
                      <template v-slot:buttons>
                        <span>{{$t('message.receivedNotifys')}}: <span style="font-weight: bold; color: #409eff">{{ getComputedNotifyDisplayResultList.length }} </span></span>
                        <vxe-input v-model="cache.notifyDisplayFilterContent" type="search" :placeholder="$t('message.searchMac')" size="small"></vxe-input>
                        <vxe-button @click="openNotify" status="primary" size="small" v-show="!store.devConfDisplayVars.isNotifyOn">{{$t('message.open')}}</vxe-button>
                        <vxe-button @click="closeNotify" status="danger" size="small" v-show="store.devConfDisplayVars.isNotifyOn">{{$t('message.close')}}</vxe-button>
                        <vxe-button @click="notifyDisplayResultExport" status="primary" size="small">{{$t('message.export')}}</vxe-button>
                        <vxe-button @click="notifyDisplayResultClear" status="danger" size="small">{{$t('message.clear')}}</vxe-button>
                      </template>
                    </vxe-toolbar>
                    <!-- 注意设置为固定高度，否则页面在过多的数据时候会造成卡顿，TODO: 是否考虑使用分页优化? -->
                    <vxe-grid 
                      border="none"
                      show-overflow
                      stripe
                      height="560px"
                      highlight-hover-row
                      :header-row-style="{'background-color': '#f4f5f6'}"
                      ref="refNotifyDisplayResultGrid"
                      :sort-config="{trigger: 'cell'}"
                      :data="getComputedNotifyDisplayResultList">
                      <vxe-table-column field="time" :title="$t('message.timestamp')" type="html" width="20%" sortable></vxe-table-column>
                      <vxe-table-column field="mac" :title="$t('message.addr')" type="html" width="30%" show-overflow></vxe-table-column>
                      <vxe-table-column field="handle" title="HANDLE" width="10%" ></vxe-table-column>
                      <vxe-table-column field="value" title="VALUE" width="40%" show-overflow></vxe-table-column>
                      <template v-slot:empty>
                        <span>
                          <p>{{$t('message.noData')}}</p>
                        </span>
                      </template>
                    </vxe-grid>
                  </el-row>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-show="store.devConfDisplayVars.activeMenuItem === 'apiLogListMenuItem'">
                <el-tab-pane>
                  <span slot="label"><i class="el-icon-caret-bottom"></i> {{$t('message.apiLogList')}}</span>
                  <el-row>
                    <vxe-toolbar>
                      <template v-slot:buttons>
                        <span>{{$t('message.logsCount')}}: <span style="font-weight: bold; color: #409eff">{{ getComputedApiLogDisplayResultList().length }} </span></span>
                        <vxe-input v-model="cache.apiLogDisplayFilterContent" type="search" :placeholder="$t('message.search')" size="small"></vxe-input>
                        <vxe-button @click="apiLogDisplayResultExport" status="primary" size="small">{{$t('message.export')}}</vxe-button>
                        <vxe-button @click="apiLogDisplayResultClear" status="danger" size="small">{{$t('message.clear')}}</vxe-button>
                      </template>
                    </vxe-toolbar>
                    <!-- 注意设置为固定高度，否则页面在过多的数据时候会造成卡顿，TODO: 是否考虑使用分页优化? -->
                    <vxe-grid 
                      border="none"
                      stripe
                      height="560px"
                      highlight-hover-row
                      :header-row-style="{'background-color': '#f4f5f6'}"
                      ref="refApiLogDisplayResultGrid"
                      :sort-config="{trigger: 'cell'}"
                      :data="getComputedApiLogDisplayResultList()">
                      <vxe-table-column field="timeStr" :title="$t('message.time')" type="html" width="20%" sortable></vxe-table-column>
                      <vxe-table-column field="apiName" :title="$t('message.apiName')" type="html" width="15%" sortable></vxe-table-column>
                      <vxe-table-column field="apiContentJson" :title="$t('message.reqContent')" type="html" width="65%" sortable></vxe-table-column>
                      <!-- TODO: 增加重放功能 -->
                      <template v-slot:empty>
                        <span>
                          <p>{{$t('message.noData')}}</p>
                        </span>
                      </template>
                    </vxe-grid>
                  </el-row>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-model="store.devConfDisplayVars.activeApiTabName" v-show="store.devConfDisplayVars.activeMenuItem === 'apiDebuggerMenuItem'">
                <el-tab-pane name="scan">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'scan' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.scanDevices')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.scanDevicesInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#scan-bluetooth-devices" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.useChip')">
                      <el-radio-group v-model="store.devConfDisplayVars.apiDebuggerParams['scan'].chip" size="small">
                        <el-radio-button :label="0">{{$t('message.chip0')}}</el-radio-button>
                        <el-radio-button :label="1">{{$t('message.chip1')}}</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item :label="$t('message.filterName')">
                      <el-select v-model="store.devConfDisplayVars.apiDebuggerParams['scan'].filter_name" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')" :placeholder="$t('message.pleaseInput')" multiple filterable allow-create default-first-option style="width: 100%">
                      </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.filterMac')">
                      <el-select v-model="store.devConfDisplayVars.apiDebuggerParams['scan'].filter_mac" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')"  :placeholder="$t('message.pleaseInput')" multiple filterable allow-create default-first-option style="width: 100%">
                      </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('message.fitlerRSSI')">
                      <el-slider
                      v-model="store.devConfDisplayVars.apiDebuggerParams['scan'].filter_rssi"
                      show-input
                      :min="-85"
                      :max="0">
                    </el-slider>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi" v-show="!store.devConfDisplayVars.isApiScanning">{{$t('message.startDebug')}}</el-button>
                        <el-button type="danger" size="small" @click="stopApiScan" v-show="store.devConfDisplayVars.isApiScanning">{{$t('message.stopScan')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="connect">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'connect' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.connectDevice')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.connectDeviceInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#connectdisconnect-to-a-target-device" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.useChip')">
                      <el-radio-group v-model="store.devConfDisplayVars.apiDebuggerParams['connect'].chip" size="small">
                        <el-radio-button label="0">{{$t('message.chip0')}}</el-radio-button>
                        <el-radio-button label="1">{{$t('message.chip1')}}</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item :label="$t('message.addrType')">
                      <el-radio-group v-model="store.devConfDisplayVars.apiDebuggerParams['connect'].addrType" size="small">
                        <el-radio-button label="public">PUBLIC</el-radio-button>
                        <el-radio-button label="random">RANDOM</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item :label="$t('message.deviceAddr')">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['connect'].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="read">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'read' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.readData')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.readDataInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#readwrite-the-value-of-a-specific-characteristic" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item label="HANDLE">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['read'].handle"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.deviceAddr')">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['read'].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="write">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'write' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.writeData')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.writeDataInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#readwrite-the-value-of-a-specific-characteristic" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item label="HANDLE">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['write'].handle"></el-input>
                    </el-form-item>
                    <el-form-item label="VALUE">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['write'].value"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.writeStyle')">
                      <el-radio-group v-model="store.devConfDisplayVars.apiDebuggerParams['write'].noresponse" size="small">
                        <el-radio-button label="false">{{$t('message.wait')}}</el-radio-button>
                        <el-radio-button label="true">{{$t('message.noWait')}}</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item :label="$t('message.deviceAddr')">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['write'].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="disconnect">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'disconnect' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.disConnect')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.disConnectInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#connectdisconnect-to-a-target-device" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.deviceAddr')">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['disconnect'].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="connectList">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'connectList' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.connectList')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.connectListInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#connectdisconnect-to-a-target-device" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="discover">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'discover' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.deviceServices')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.deivceServicesInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#discover-gatt-services-and-characteristics" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.deviceAddr')">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['discover'].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="notify">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'notify' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.openNotify')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.openNotifyInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#receive-notification-and-indication" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="connectStatus">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'connectStatus' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.connectStatus')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.connectStatusInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#get-device-connection-status" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="pair">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'pair' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.pair')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.pairInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#pair-request" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.deviceAddr')">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['pair'].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.ioCap')">
                      <el-select v-model="store.devConfDisplayVars.apiDebuggerParams['pair'].iocapability" style="width: 100%">
                        <el-option label="DisplayOnly" value="DisplayOnly" key="DisplayOnly"></el-option>
                        <el-option label="DisplayYesNo" value="DisplayYesNo" key="DisplayYesNo"></el-option>
                        <el-option label="KeyboardOnly" value="KeyboardOnly" key="KeyboardOnly"></el-option>
                        <el-option label="NoInputNoOutput" value="NoInputNoOutput" key="NoInputNoOutput"></el-option>
                        <el-option label="KeyboardDisplay" value="KeyboardDisplay" key="KeyboardDisplay"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="pairInput">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'pairInput' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.pairInput')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.pairInputInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#pair-input-request" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.deviceAddr')">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['pairInput'].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.inputType')">
                      <el-select v-model="store.devConfDisplayVars.apiDebuggerParams['pairInput'].inputType" style="width: 100%">
                        <el-option label="Passkey" value="Passkey" key="Passkey"></el-option>
                        <el-option label="LegacyOOB" value="LegacyOOB" key="LegacyOOB"></el-option>
                        <el-option label="SecurityOOB" value="SecurityOOB" key="SecurityOOB"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="passkey" v-show="store.devConfDisplayVars.apiDebuggerParams['pairInput'].inputType === 'Passkey'">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['pairInput'].passkey"></el-input>
                    </el-form-item>
                    <el-form-item label="tk" v-show="store.devConfDisplayVars.apiDebuggerParams['pairInput'].inputType === 'LegacyOOB'">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['pairInput'].tk"></el-input>
                    </el-form-item>
                    <el-form-item label="rand" v-show="store.devConfDisplayVars.apiDebuggerParams['pairInput'].inputType === 'SecurityOOB'">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['pairInput'].rand"></el-input>
                    </el-form-item>
                    <el-form-item label="confirm" v-show="store.devConfDisplayVars.apiDebuggerParams['pairInput'].inputType === 'SecurityOOB'">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['pairInput'].confirm"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane name="unpair">
                  <span slot="label"><i :class="store.devConfDisplayVars.activeApiTabName === 'unpair' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.unpair')}}</span>
                  <el-row class="apiHelp">
                    {{$t('message.unpairInfo')}}
                    <a href="https://github.com/CassiaNetworks/CassiaSDKGuide/wiki/RESTful-API#unpair-request" target="_blank">{{$t('message.more')}}</a>
                  </el-row>
                  <el-form label-width="100px" style="margin-top: 15px;" size="small">
                    <el-form-item :label="$t('message.router')">
                      <el-input :disabled="true" v-model="store.devConf.controlStyle === 'ap' ? store.devConf.serverURI : store.devConf.mac"></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('message.deviceAddr')">
                      <el-input clearable v-model="store.devConfDisplayVars.apiDebuggerParams['unpair'].deviceMac"></el-input>
                    </el-form-item>
                    <el-form-item align="left">
                      <el-button-group>
                        <el-button type="primary" size="small" @click="startDebugApi">{{$t('message.startDebug')}}</el-button>
                        <el-button type="primary" size="small" @click="genCode">{{$t('message.genCode')}}</el-button>
                      </el-button-group>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-model="store.devConfDisplayVars.activeApiOutputTabName" v-show="store.devConfDisplayVars.activeMenuItem === 'apiDebuggerMenuItem'">
                <el-tab-pane name="output">
                  <span slot="label">{{$t('message.debugResult')}}</span>
                  <!--
                  <el-button-group>
                    <el-button size="small" type="primary" @click="exportApiOutputDisplay">导出</el-button>
                    <el-button size="small" type="danger" @click="clearApiOutputDisplay">清空</el-button>
                  </el-button-group>
                  -->
                  <highlight-code lang="javascript" v-if="store.devConfDisplayVars.activeApiTabName === 'scan' && cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].displayResultList.length > 0" v-infinite-scroll="loadApiDebuggerResult" infinite-scroll-distance="200px" :infinite-scroll-disabled="cache.isApiDebuggerLoading">
                    {{ cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].displayResultList.join('\n') }}
                  </highlight-code>
                  <highlight-code lang="javascript" v-if="store.devConfDisplayVars.activeApiTabName !== 'scan' && cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].resultList.length > 0">
                    {{ cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].resultList.join('\n') }}
                  </highlight-code>
                </el-tab-pane>
                <el-tab-pane name="curl">
                  <span slot="label">cURL</span>
                  <highlight-code lang="bash" v-if="cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].code['curl'].length > 0">
                    {{ cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].code['curl'] }}
                  </highlight-code>
                </el-tab-pane>
                <el-tab-pane name="nodejs">
                  <span slot="label">NodeJS</span>
                  <highlight-code lang="js" v-if="cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].code['nodejs'].length > 0">
                    {{ cache.apiDebuggerResult[store.devConfDisplayVars.activeApiTabName].code['nodejs'] }}
                  </highlight-code>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-show="store.devConfDisplayVars.activeMenuItem === 'apiDemoMenuItem'" v-model="store.devConfDisplayVars.apiDemoTabsActiveTab">
                <el-tab-pane name="singleDevice">
                  <span slot="label"><i :class="store.devConfDisplayVars.apiDemoTabsActiveTab === 'singleDevice' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.connectWriteNotify')}}</span>
                  <el-card shadow="hover">
                    <div slot="header" class="clearfix">
                      <span>1.{{$t('message.connectDevice')}}</span>
                      <el-button @click="apiDemoConnectTest" style="float: right; padding: 3px 0" type="text">{{$t('message.test')}}</el-button>
                    </div>
                    <el-form label-width="100px" size="small">
                      <el-form-item :label="$t('message.historyApi')">
                        <el-select @change="apiDemoConnectChanged" v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.connect.tempFromApiLogUrl" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')" :placeholder="$t('message.pleaseSelect')" style="width: 100%">
                          <el-option v-for="(logItem, index) in getApiLogListByFilter({apiName: $t('message.connectDevice')})" :label="logItem.apiContentJson" :value="logItem.apiContentJson" :key="index"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item :label="$t('message.useChip')">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.connect.chip" size="small">
                          <el-radio-button label="0">{{$t('message.chip0')}}</el-radio-button>
                          <el-radio-button label="1">{{$t('message.chip1')}}</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item :label="$t('message.addrType')">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.connect.addrType" size="small">
                          <el-radio-button label="public">PUBLIC</el-radio-button>
                          <el-radio-button label="random">RANDOM</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item :label="$t('message.deviceAddr')">
                        <el-input clearable v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.connect.deviceMac"></el-input>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px;">
                    <div slot="header" class="clearfix">
                      <span>2.{{$t('message.writeCmd')}}</span>
                      <el-button @click="apiDemoWriteTest" style="float: right; padding: 3px 0" type="text">{{$t('message.test')}}</el-button>
                    </div>
                    <el-form label-width="100px" size="small">
                      <el-form-item :label="$t('message.historyApi')">
                        <el-select @change="apiDemoWriteChanged" v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.write.tempFromApiLogUrl" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')" :placeholder="$t('message.pleaseSelect')" style="width: 100%">
                          <el-option v-for="(logItem, index) in getApiLogListByFilter({apiName: $t('message.writeData')})" :label="logItem.apiContentJson" :value="logItem.apiContentJson" :key="index"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="HANDLE">
                        <el-input clearable v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.write.handle"></el-input>
                      </el-form-item>
                      <el-form-item label="VALUE">
                        <el-input clearable v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.write.value"></el-input>
                      </el-form-item>
                      <el-form-item :label="$t('message.writeStyle')">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.write.noresponse" size="small">
                          <el-radio-button label="false">{{$t('message.wait')}}</el-radio-button>
                          <el-radio-button label="true">{{$t('message.noWait')}}</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px;">
                    <div slot="header" class="clearfix">
                      <span>3.{{$t('message.receiveNotify')}}</span>
                    </div>
                    <el-form label-width="100px" size="small">
                      <span style="font-size: 12px">{{$t('message.receiveDataBySSE')}}</span>
                    </el-form>
                  </el-card>
                  <el-button-group style="margin-top: 15px;">
                    <el-button type="primary" size="small" @click="apiDemoConnectWriteNotifyGenCode">{{$t('message.genCode')}}</el-button>
                    <el-button type="primary" size="small">{{$t('message.clearData')}}</el-button>
                  </el-button-group>
                  <highlight-code lang="javascript" v-if="store.devConfDisplayVars.apiDemoParams.connectWriteNotify.code.length > 0">
                    {{ store.devConfDisplayVars.apiDemoParams.connectWriteNotify.code }}
                  </highlight-code>
                </el-tab-pane>
                <el-tab-pane name="multipleDevice">
                  <span slot="label"><i :class="store.devConfDisplayVars.apiDemoTabsActiveTab === 'multipleDevice' ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i> {{$t('message.scanConnectWriteNotify')}}</span>
                  <el-card shadow="hover">
                    <div slot="header" class="clearfix">
                      <span>1.{{$t('message.scanDevices')}}</span>
                      <el-button @click="apiDemoScanTest" style="float: right; padding: 3px 0" type="text">{{$t('message.test')}}</el-button>
                    </div>
                    <el-form label-width="100px" style="margin-top: 15px;" size="small">
                      <el-form-item :label="$t('message.historyApi')">
                        <el-select @change="apiDemoScanChanged" v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.tempFromApiLogUrl" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')" :placeholder="$t('message.pleaseInput')" style="width: 100%">
                          <el-option v-for="(logItem, index) in getApiLogListByFilter({apiName: $t('message.scanDevices')})" :label="logItem.apiContentJson" :value="logItem.apiContentJson" :key="index"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item :label="$t('message.useChip')">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.chip" size="small">
                          <el-radio-button :label="0">{{$t('message.chip0')}}</el-radio-button>
                          <el-radio-button :label="1">{{$t('message.chip1')}}</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item :label="$t('message.filterName')">
                        <el-select v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.filter_name" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')" :placeholder="$t('message.pleaseInput')" multiple filterable allow-create default-first-option style="width: 100%">
                        </el-select>
                      </el-form-item>
                      <el-form-item :label="$t('message.filterMac')">
                        <el-select v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.filter_mac" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')" :placeholder="$t('message.pleaseInput')" multiple filterable allow-create default-first-option style="width: 100%">
                        </el-select>
                      </el-form-item>
                      <el-form-item :label="$t('message.fitlerRSSI')">
                        <el-slider
                        v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.scan.filter_rssi"
                        show-input
                        :min="-85"
                        :max="0">
                      </el-slider>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px;">
                    <div slot="header" class="clearfix">
                      <span>2.{{$t('message.connectDevice')}}</span>
                    </div>
                    <el-form label-width="100px" size="small">
                      <span style="font-size: 12px">{{$t('message.connectScannedDevices')}}</span>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px;">
                    <div slot="header" class="clearfix">
                      <span>3.{{$t('message.writeCmd')}}</span>
                    </div>
                    <el-form label-width="100px" size="small">
                      <el-form-item :label="$t('message.historyApi')">
                        <el-select @change="apiDemoWriteChanged" v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.write.tempFromApiLogUrl" :no-data-text="$t('message.noData')" :no-match-text="$t('message.noMatchData')" :placeholder="$t('message.pleaseSelect')" style="width: 100%">
                          <el-option v-for="(logItem, index) in getApiLogListByFilter({apiName: $t('message.writeData')})" :label="logItem.apiContentJson" :value="logItem.apiContentJson" :key="index"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="HANDLE">
                        <el-input clearable v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.write.handle"></el-input>
                      </el-form-item>
                      <el-form-item label="VALUE">
                        <el-input clearable v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.write.value"></el-input>
                      </el-form-item>
                      <el-form-item :label="$t('message.writeStyle')">
                        <el-radio-group v-model="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.write.noresponse" size="small">
                          <el-radio-button label="false">{{$t('message.wait')}}</el-radio-button>
                          <el-radio-button label="true">{{$t('message.noWait')}}</el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-button-group style="margin-top: 15px;">
                    <el-button type="primary" size="small" @click="apiDemoScanConnectWriteNotifyGenCode">{{$t('message.genCode')}}</el-button>
                    <el-button type="primary" size="small">{{$t('message.clearData')}}</el-button>
                  </el-button-group>
                  <highlight-code lang="javascript" v-if="store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.code.length > 0">
                    {{ store.devConfDisplayVars.apiDemoParams.scanConnectWriteNotify.code }}
                  </highlight-code>
                </el-tab-pane>
              </el-tabs>
              <el-tabs v-show="store.devConfDisplayVars.activeMenuItem === 'toolsMenuItem'">
                <el-tab-pane>
                  <span slot="label"><i class="el-icon-caret-bottom"></i> {{$t('message.tools')}}</span>
                  <el-card shadow="hover">
                    <div slot="header" class="clearfix">
                      <span>{{$t('message.binaryConversion')}}</span>
                    </div>
                    <el-form :inline="true" size="small" style="width: 100%">
                      <el-form-item>
                        <el-radio-group v-model="store.devConfDisplayVars.toolsBinaryConversion.type">
                          <el-radio-button label="2"></el-radio-button>
                          <el-radio-button label="10"></el-radio-button>
                          <el-radio-button label="16"></el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item>
                        <el-input clearable v-model="store.devConfDisplayVars.toolsBinaryConversion.value">
                        </el-input>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px">
                    <div slot="header" class="clearfix">
                      <span>HEX/TEXT</span>
                    </div>
                    <el-form :inline="true" size="small" style="width: 100%">
                      <el-form-item>
                        <el-radio-group v-model="store.devConfDisplayVars.toolsHexTextConversion.type">
                          <el-radio-button label="hex"></el-radio-button>
                          <el-radio-button label="text"></el-radio-button>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item>
                        <el-input clearable v-model="store.devConfDisplayVars.toolsHexTextConversion.value">
                        </el-input>
                      </el-form-item>
                    </el-form>
                  </el-card>
                  <el-card shadow="hover" style="margin-top: 15px">
                    <div slot="header" class="clearfix">
                      <span>{{$t('message.jsonFormatter')}}</span>
                    </div>
                    <el-form size="small" style="width: 100%">
                      <el-form-item>
                        <el-input clearable v-model="store.devConfDisplayVars.toolsJsonConversion.inline">
                        </el-input>
                      </el-form-item>
                      <el-form-item>
                        <highlight-code lang="javascript" v-if="store.devConfDisplayVars.toolsJsonConversion.format.length > 0">
                          {{ store.devConfDisplayVars.toolsJsonConversion.format }}
                        </highlight-code>
                      </el-form-item>
                    </el-form>
                  </el-card>
                </el-tab-pane>
              </el-tabs>
            </el-main>
          </el-container>
        </el-main>
      </el-container>
    </el-container>
    <el-dialog
      title="Security OOB"
      center
      :visible.sync="store.devConfDisplayVars.pairBySecurityOOB.visible">
      <el-form label-width="80px" size="small">
        <el-form-item :label="$t('message.deviceAddr')">
          <el-input v-model="store.devConfDisplayVars.pairBySecurityOOB.deviceMac" disabled></el-input>
        </el-form-item>
        <el-form-item label="rand">
          <el-input v-model="store.devConfDisplayVars.pairBySecurityOOB.rand" clearable></el-input>
        </el-form-item>
        <el-form-item label="confirm">
          <el-input v-model="store.devConfDisplayVars.pairBySecurityOOB.confirm" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="store.devConfDisplayVars.pairBySecurityOOB.visible = false">{{$t('message.cancel')}}</el-button>
        <el-button type="primary" @click="pairBySecurityOOB">{{$t('message.ok')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="LE Legacy OOB"
      center
      :visible.sync="store.devConfDisplayVars.pairByLegacyOOB.visible">
      <el-form label-width="80px" size="small">
        <el-form-item :label="$t('message.deviceAddr')">
          <el-input v-model="store.devConfDisplayVars.pairByLegacyOOB.deviceMac" disabled></el-input>
        </el-form-item>
        <el-form-item label="tk">
          <el-input v-model="store.devConfDisplayVars.pairByLegacyOOB.tk" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="store.devConfDisplayVars.pairByLegacyOOB.visible = false">{{$t('message.cancel')}}</el-button>
        <el-button type="primary" @click="pairByLegacyOOB">{{$t('message.ok')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Passkey"
      center
      :visible.sync="store.devConfDisplayVars.pairByPasskey.visible">
      <el-form label-width="80px" size="small">
        <el-form-item :label="$t('message.deviceAddr')">
          <el-input v-model="store.devConfDisplayVars.pairByPasskey.deviceMac" disabled></el-input>
        </el-form-item>
        <el-form-item label="passkey">
          <el-input v-model="store.devConfDisplayVars.pairByPasskey.passkey" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="store.devConfDisplayVars.pairByPasskey.visible = false">{{$t('message.cancel')}}</el-button>
        <el-button type="primary" @click="pairByPasskey">{{$t('message.ok')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

import vueModule from './module/vue.js';
export default vueModule.createVue();

</script>

<style>
HTML {
}

HTML, BODY {
  margin: 0px;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
}

* {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}

.col1 {
  height: 100%;
  background-color: #fff;
  font-size: 14px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  /* margin-left: 10px; */
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  /* margin-left: 10px; */
  vertical-align: bottom;
}

/* 取消显示侧边菜单的右侧边框 */
.el-menu-vertical-demo {
  /* border-left: 1px solid #e6e6e6; */
  border-right: 0px;
  width: 100%;
  height: 100%;
  text-align: center;
}

input::-webkit-input-placeholder {
  /* font-style: italic; */
}

div::-webkit-scrollbar {
  width: 0;
}

pre::-webkit-scrollbar {
  width: 0;
}

code {
  overflow-y: scroll;
}

.hljs {
  font-size: 12px;
  padding: 15px;
}

/* 当页面加载完再显示 */
[v-cloak]{
  display: none;
}

.el-menu-item.is-active {
  background-color: #22315f !important;
}

.el-radio-button__inner {
  width: 80px;
}

.apiHelp {
  background-color:#eefbea; 
  color: #67C23A; 
  font-size: 12px; 
  padding: 10px 15px 10px 15px; 
  border-radius: 3px;
}

.apiHelp a {
  color: #67C23A;
}

.el-notification__content {
  word-break: break-all;
}
</style>
