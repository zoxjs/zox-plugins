# Develop your app and node modules using plugins

The PluginDiscovery can auto-load plugins in your project and node_modules.

Write a plugin:

```ts
@MathPlugin({ operation: 'add' })
export class AddPlugin implements IMathPlugin
{
    calc(args: MyArgs): number
    {
        return args.A + args.B;
    }
}
```

Scan the entire project, a directory, a .js file or just a single class:

```js
const pluginDiscovery = new PluginDiscovery();
await pluginDiscovery.scanProject();
await pluginDiscovery.scanDirectory('Plugins');
pluginDiscovery.scanModule(require('./Plugins/AddPlugin'));
pluginDiscovery.scan(AddPlugin);
```

Access all plugins of the same type using their pluginkey:

```js
pluginDiscovery.getPlugins(pluginkey);
```
