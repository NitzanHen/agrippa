import { cstr, indent } from './strings';

/**
 * Create a const declaration string
 * 
 * @param name the name to give the const
 * @param value the value to assign to the const
 * @param exported whether the const should be exported
 * @param type optional Typescript type for the const
 * 
 * @example
 * declateConst('classes', 'useStyles()', false) => const classes = useStyles();
 */
export const declareConst = (name: string, value: string, exported: boolean = false, type: string = '') =>
  `${cstr(exported, 'export ')}const ${name}${cstr(!!type, `: ${type}`)} = ${value};`;

/**
 * Create an interface declaration string.
 * This can easily be modified to add the ability to extend from another interface
 * or specify interface props.
 * 
 * @param name the name to give the interface
 * @param exported whether the interface should be exported
 * 
 * @example
 * declareInterface('ButtonProps', true) => export interface ButtonProps {}
 */
export const declareInterface = (name: string, exported: boolean = false) =>
  `${cstr(exported, 'export ')}interface ${name} {}`;

/**
 * Create a TS `type` declaration string.
 * This can easily be modified to add the ability to specify the Type itself.
 * 
 * @param name 
 * @param exported 
 * 
 * @example
 * declareType('ButtonProps', true) => export type ButtonProps = {};
 */
export const declareType = (name: string, exported: boolean = false) =>
  `${cstr(exported, 'export ')}type ${name} = {};`;

/**
 * Create a function declaration string.
 * Could also be used as a function value (for this use case `exported` must be false, though).
 * 
 * @param name the name to give the function
 * @param params *a string* representing the function's parameters 
 * @param body the function's body (as a string)
 * @param exported whether to export the function or not
 */
export const declareFunction = (name: string, params: string = '', body: string = '', exported: boolean = false) =>
  `${cstr(exported, 'export ')}function ${name}(${params}) {${body ? `\n${indent(body)}\n` : ' '}}`;


/**
 * Create an arrow function string
 * 
 * @param params *a string* representing the function's parameters 
 * @param body the function's body (as a string)
 */
export const createArrowFunction = (params: string = '', body: string = '') =>
  `(${params}) => {${cstr(!!body, '\n' + indent(body) + '\n')}}`;

/**
 * Create a default export string
 * @param name the name of the value to be exported
 */
export const createDefaultExport = (name: string) => `export default ${name};`;

/**
 * Creates an assignment string.
 * The key is taken to be a simple key, such that dot notation is uses.
 * 
 * @param target the object to assign to
 * @param key the key of the field to assign the value to
 * @param value the value to assign
 * 
 * @example
 * createAssignment('Button', 'propTypes', '{}') => Button.propTypes = {};
 */
export const createAssignment = (target: string, key: string, value: string) =>
  `${target}.${key} = ${value};`;