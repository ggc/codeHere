package mv.model.instructions.arithmetic;

import mv.model.ControlUnit;
import mv.model.Instruction;
import mv.model.Memory;
import mv.model.OperandStack;
import mv.model.exceptions.instructions.InstructionException;
import mv.model.exceptions.stack.FullStackException;
import mv.model.instructions.NoParamTwoOperandInstruction;

/**
 * @author Alejandro Pequeño Pulleiro, Gabriel Galán Casillas
 *
 */

public class Mul extends NoParamTwoOperandInstruction {

	public Mul(){
		super("MUL");
	}

	protected Instruction createInstruction(){
		return new Mul();

	}

	protected void operate(OperandStack stack,Memory memory,ControlUnit control,int operand1,int operand2) throws InstructionException{

		try {
			stack.push(operand1 * operand2);
		} catch (FullStackException e) {
 			throw new InstructionException(this, e);
		}
	}

}
