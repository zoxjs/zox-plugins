import {PluginDiscovery} from "../index";
import {MyPluginManager} from "./PluginManagers/MyPluginManager";

(async function example() {

const pluginDiscovery = new PluginDiscovery();
await pluginDiscovery.scanNodeModules();
await pluginDiscovery.scanDirectory('examples/Plugins');

const myPluginManager = new MyPluginManager(pluginDiscovery);
const plugins = myPluginManager.getAllPlugins();

console.log('my plugins:', plugins);

})();
