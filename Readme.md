# Develop your app and node modules using plugins!

Use PluginDiscovery to auto-load plugins in your project and node_modules.

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

Scan the entire project, a directory, a .js/.jsx/.ts/.tsx file or just a single class or function:

```js
const pluginDiscovery = new PluginDiscovery();
await pluginDiscovery.scanProject();
await pluginDiscovery.scanNodeModules();
await pluginDiscovery.scanDirectory('Plugins');
pluginDiscovery.scanModule(require('./Plugins/AddPlugin'));
pluginDiscovery.scan(AddPlugin);
```

Individual plugins can also be manually added:

```js
pluginDiscovery.add(pluginkey, AddPlugin, /* optional data */);
```

Access all plugins of the same type using their pluginkey:

```js
pluginDiscovery.getPlugins(pluginkey);
```

You can also clear the plugin list, but it's unlikely that you will need to do this.

```js
pluginDiscovery.clear();
```

## package.json

Scanning a project is done based on configuration in your **package.json** file.

You can specify a list of files to load (extensions are optional):

```json
{
  "plugins": {
    "files": [
      "src/FooPlugin",
      "src/BarPlugin"
    ]
  }
}
```

You can specify directories that contain your plugins,  
in which case all .js/.jsx/.ts/.tsx files in those folders will be loaded:

```json
{
  "plugins": {
    "dirs": [
      "src/Plugins"
    ]
  }
}
```

Or you can do both

```json
{
  "plugins": {
    "files": [
      "src/FooPlugin",
      "src/BarPlugin"
    ],
    "dirs": [
      "src/Plugins"
    ]
  }
}
```
