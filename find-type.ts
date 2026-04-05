import * as ts from 'typescript';

const program = ts.createProgram(['app/(auth)/sign-up.tsx'], {
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    esModuleInterop: true,
    strict: true,
});

const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile('app/(auth)/sign-up.tsx');

function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && node.expression.getText() === 'useSignUp') {
        const type = checker.getReturnTypeOfSignature(checker.getResolvedSignature(node)!);
        const signUpProp = type.getProperty('signUp');
        if (signUpProp) {
            const signUpType = checker.getTypeOfSymbolAtLocation(signUpProp, node);
            console.log("SignUp Properties:");
            signUpType.getProperties().forEach(p => console.log(p.getName()));
        }
    }
    ts.forEachChild(node, visit);
}

if (sourceFile) visit(sourceFile);
